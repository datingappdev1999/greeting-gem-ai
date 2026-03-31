import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type StoredOrder = {
  pdfPath: string | null;
  flowerId: string | null;
  chocolateId: string | null;
  templateId: string | null;
};

export default function CheckoutPage() {
  const order = useMemo<StoredOrder | null>(() => {
    try {
      const raw = localStorage.getItem("gg_checkout_order");
      return raw ? (JSON.parse(raw) as StoredOrder) : null;
    } catch {
      return null;
    }
  }, []);

  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostcode, setShippingPostcode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("GB");

  const cardPrice = 5.59;
  const total = cardPrice;

  const isSuccess = useMemo(
    () => new URLSearchParams(window.location.search).get("success") === "true",
    []
  );
  const isCanceled = useMemo(
    () => new URLSearchParams(window.location.search).get("canceled") === "true",
    []
  );

  const handleStripeCheckout = async () => {
    if (!order?.pdfPath) {
      toast.error("Missing generated PDF. Please customise your card again.");
      return;
    }
    if (!shippingName || !shippingLine1 || !shippingCity || !shippingPostcode || !shippingCountry) {
      toast.error("Please complete your shipping address.");
      return;
    }
    setIsRedirectingToStripe(true);
    try {
      const r = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: order.templateId,
          pdfPath: order.pdfPath,
          shippingAddress: {
            name: shippingName,
            line1: shippingLine1,
            line2: shippingLine2,
            city: shippingCity,
            postcode: shippingPostcode,
            country: shippingCountry,
          },
        }),
      });
      if (!r.ok) {
        const err = await r
          .json()
          .catch(() => ({ message: "Could not start Stripe checkout." as string }));
        toast.error(err?.message || "Could not start Stripe checkout.");
        return;
      }
      const data: { url?: string } = await r.json();
      if (!data.url) {
        toast.error("Stripe checkout URL was not returned.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Could not reach payment service. Please try again.");
    } finally {
      setIsRedirectingToStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-14 max-w-3xl">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter your shipping address, then complete payment securely on Stripe.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          {isSuccess ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 mb-4">
              Payment successful. Thank you for your order.
            </p>
          ) : null}
          {isCanceled ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 mb-4">
              Payment was canceled. You can try again below.
            </p>
          ) : null}

          <div className="space-y-3">
            <p className="font-display text-sm font-medium text-foreground">Shipping address</p>
            <div>
              <label className="mb-1.5 block text-sm text-foreground/90">Full name</label>
              <Input value={shippingName} onChange={(e) => setShippingName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-foreground/90">Address line 1</label>
              <Input value={shippingLine1} onChange={(e) => setShippingLine1(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-foreground/90">
                Address line 2 (optional)
              </label>
              <Input value={shippingLine2} onChange={(e) => setShippingLine2(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-sm text-foreground/90">City</label>
                <Input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-foreground/90">Postcode</label>
                <Input
                  value={shippingPostcode}
                  onChange={(e) => setShippingPostcode(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-foreground/90">Country</label>
                <Input value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="font-display text-sm font-medium text-foreground mb-2">
              Order summary
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-foreground/90">Card</span>
                <span className="tabular-nums text-foreground">£{cardPrice.toFixed(2)}</span>
              </div>

              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                <span className="font-display text-foreground font-medium">Total</span>
                <span className="tabular-nums text-foreground font-medium">
                  £{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-display"
              onClick={() => history.back()}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 font-display"
              onClick={handleStripeCheckout}
              disabled={isRedirectingToStripe}
            >
              {isRedirectingToStripe ? "Redirecting…" : "Check out now"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

