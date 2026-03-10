import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OCCASIONS, pickBestTemplate, type Occasion, type TemplateCard } from "@/lib/occasionsData";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import { getCardTemplateConfig } from "@/templates";
import { cn } from "@/lib/utils";

export type ChatStepId = "occasion" | "recipient" | "tone" | "photos" | "context";

export interface AIChatAnswers {
  occasionSlug: string | null;
  occasionName: string | null;
  recipient: string;
  tone: string;
  photos: string;
  context: string;
}

const OCCASION_OPTIONS = OCCASIONS.map((o) => ({ slug: o.slug, name: o.name }));

const STEP_CONFIG: { id: ChatStepId; question: string; placeholder?: string; isOccasionPicker?: boolean }[] = [
  { id: "occasion", question: "What is the occasion?", isOccasionPicker: true },
  { id: "recipient", question: "Who's the recipient and what's their name?", placeholder: "e.g. My grandpa, Nigel" },
  { id: "tone", question: "What's the tone?", placeholder: "e.g. Warm and funny, heartfelt, formal" },
  { id: "photos", question: "Do you want to add any photos?", placeholder: "Yes / No, or describe what you'd like" },
  { id: "context", question: "Do you want to add any other context? (e.g. nicknames, inside jokes)", placeholder: "Optional" },
];

function getOccasionBySlug(slug: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.slug === slug);
}

interface AIChatOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When user opened from an occasion page, pass that occasion to skip the first question */
  initialOccasion?: { slug: string; name: string } | null;
}

export default function AIChatOverlay({ open, onOpenChange, initialOccasion }: AIChatOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AIChatAnswers>({
    occasionSlug: null,
    occasionName: null,
    recipient: "",
    tone: "",
    photos: "",
    context: "",
  });
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([]);
  const [phase, setPhase] = useState<"chat" | "synthesising" | "result">("chat");
  const [generatedCard, setGeneratedCard] = useState<{ template: TemplateCard; occasion: Occasion } | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = initialOccasion
    ? STEP_CONFIG.slice(1) // skip occasion
    : STEP_CONFIG;
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (open && initialOccasion) {
      setAnswers((a) => ({
        ...a,
        occasionSlug: initialOccasion.slug,
        occasionName: initialOccasion.name,
      }));
    }
  }, [open, initialOccasion]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, stepIndex]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value && currentStep?.id !== "photos" && currentStep?.id !== "context") return;

    const reply = value || (uploadedPhotoUrl ? "Yes, I've added a photo" : "No");
    setMessages((m) => [...m, { role: "user", text: reply }]);
    setInputValue("");

    const nextAnswers = { ...answers };
    if (currentStep?.id === "occasion") {
      const chosen = OCCASION_OPTIONS.find((o) => o.name.toLowerCase() === value.toLowerCase()) ||
        OCCASION_OPTIONS.find((o) => o.slug === value.toLowerCase().replace(/\s+/g, "-"));
      if (chosen) {
        nextAnswers.occasionSlug = chosen.slug;
        nextAnswers.occasionName = chosen.name;
      }
    } else if (currentStep?.id === "recipient") nextAnswers.recipient = reply;
    else if (currentStep?.id === "tone") nextAnswers.tone = reply;
    else if (currentStep?.id === "photos") nextAnswers.photos = reply;
    else if (currentStep?.id === "context") nextAnswers.context = reply;
    setAnswers(nextAnswers);

    if (isLastStep) {
      setPhase("synthesising");
      const slug = nextAnswers.occasionSlug || initialOccasion?.slug;
      const occasion = (slug ? getOccasionBySlug(slug) : null) ?? OCCASIONS[0];
      const hasPhoto = !!uploadedPhotoUrl;
      const template = occasion ? pickBestTemplate(occasion, hasPhoto) : occasion?.templates?.[0];
      setTimeout(() => {
        if (occasion && template) setGeneratedCard({ template, occasion });
        setPhase("result");
      }, 1500);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleOccasionSelect = (slug: string, name: string) => {
    setAnswers((a) => ({ ...a, occasionSlug: slug, occasionName: name }));
    setMessages((m) => [...m, { role: "user", text: name }]);
    setStepIndex((i) => i + 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeUploadedPhoto = () => setUploadedPhotoUrl(null);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStepIndex(0);
      setAnswers({ occasionSlug: null, occasionName: null, recipient: "", tone: "", photos: "", context: "" });
      setMessages([]);
      setInputValue("");
      setUploadedPhotoUrl(null);
      setPhase("chat");
      setGeneratedCard(null);
    }, 300);
  };

  if (!open) return null;

  const greeting = (() => {
    const name = answers.recipient || "there";
    const occasion = answers.occasionName || "Special Day";
    return `Happy ${occasion}, ${name}!`;
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden
        />

        {/* Chat box - rounded, pink/white */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl",
            "bg-gradient-to-b from-rose-100 via-pink-50 to-rose-100",
            "border-2 border-rose-200",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-medium text-foreground">Generate with AI</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Content area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
            {phase === "chat" && (
              <>
                {/* Message history */}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mb-4 flex",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        msg.role === "user"
                          ? "bg-rose-500 text-white"
                          : "bg-rose-100/70 text-foreground",
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Current question - center */}
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <p className="font-display text-xl md:text-2xl text-foreground mb-6 max-w-md">
                    {currentStep?.question}
                  </p>
                  {currentStep?.isOccasionPicker && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {OCCASION_OPTIONS.map((opt) => (
                        <button
                          key={opt.slug}
                          type="button"
                          onClick={() => handleOccasionSelect(opt.slug, opt.name)}
                          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-rose-50 hover:border-rose-300"
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {currentStep?.id === "photos" && (
                    <div className="mt-4 w-full max-w-xs mx-auto">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {uploadedPhotoUrl ? (
                        <div className="relative inline-block">
                          <img
                            src={uploadedPhotoUrl}
                            alt="Uploaded"
                            className="h-24 w-24 rounded-xl object-cover border-2 border-rose-200 shadow"
                          />
                          <button
                            type="button"
                            onClick={removeUploadedPhoto}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs hover:bg-rose-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 w-full rounded-xl border-2 border-dashed border-rose-200 bg-white/80 py-6 px-4 text-sm font-medium text-foreground hover:border-rose-300 hover:bg-rose-50/50 transition"
                        >
                          <ImagePlus className="h-8 w-8 text-rose-400" />
                          Upload a photo
                        </button>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">or type your reply below</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {phase === "synthesising" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                  <Sparkles className="h-7 w-7 text-rose-600 animate-pulse" />
                </div>
                <p className="font-display text-xl text-foreground">Creating your card...</p>
                <p className="mt-1 text-sm text-muted-foreground">Picking the perfect template and personalising it for you.</p>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-6"
              >
                {generatedCard ? (
                  <>
                    <p className="font-display text-xl text-foreground mb-4">Your card is ready</p>
                    <div className="w-full max-w-sm aspect-[3/4] max-h-[360px] mx-auto">
                      <CardTemplateRenderer
                        template={getCardTemplateConfig(generatedCard.template)}
                        userContent={{
                          headline: greeting,
                          subheading: answers.tone || undefined,
                          body: answers.context || undefined,
                          photoUrl: uploadedPhotoUrl,
                        }}
                      />
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Based on &quot;{generatedCard.template.name}&quot;</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Add a photo and edit the message when you continue.
                    </p>
                    <Button className="mt-6" onClick={handleClose}>
                      Done
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-display text-xl text-foreground">Almost there</p>
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      We&apos;re preparing your personalised card. Try again from an occasion page for the best result.
                    </p>
                    <Button className="mt-6" onClick={handleClose}>
                      Done
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Input - only in chat phase */}
          {phase === "chat" && !currentStep?.isOccasionPicker && (
            <form onSubmit={handleSubmit} className="border-t border-rose-200 p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentStep?.placeholder}
                  className="flex-1 rounded-full border-rose-200 bg-white px-4 py-6 text-base focus-visible:ring-rose-300"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-full bg-rose-500 hover:bg-rose-600"
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
