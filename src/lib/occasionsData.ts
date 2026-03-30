import mothersDayImg from "@/assets/mothers-day.jpg";
import easterImg from "@/assets/easter.jpg";
import fathersDayImg from "@/assets/fathers-day.jpg";
import weddingImg from "@/assets/wedding.jpg";
import newBabyImg from "@/assets/new-baby.jpg";
import condolencesImg from "@/assets/condolences.jpg";

// Mother's Day templates
import mdFloralCanvasFront from "@/assets/templates/md-canvas-fold-front.png";
import mdBoldBestMum from "@/assets/templates/md-bold-best-mum.jpg";
import mdFunnyTechSupport from "@/assets/templates/md-funny-tech-support.jpg";
import mdWatercolourBouquet from "@/assets/templates/md-watercolour-bouquet.jpg";
const mdPhotoOvalFrame = "/templates/md-photo-oval-frame.png";
// Easter templates
import easterPastelEggs from "@/assets/templates/easter-pastel-eggs-grid.png";
import easterBunnyFrame from "@/assets/templates/easter-bunny-photo-frame.jpg";
import easterSpringFlorals from "@/assets/templates/easter-spring-florals.jpg";
import easterMinimalCross from "@/assets/templates/easter-minimal-cross.jpg";
import easterEggHunt from "@/assets/templates/easter-egg-hunt.jpg";
// Father's Day templates
import fdBoldSuperDad from "@/assets/templates/fd-bold-super-dad.jpg";
import fdGrillKing from "@/assets/templates/fd-grill-king.jpg";
import fdToolsAndTies from "@/assets/templates/fd-tools-and-ties.jpg";
import fdPhotoCollage from "@/assets/templates/fd-photo-collage.jpg";
import fdGolfEnthusiast from "@/assets/templates/fd-golf-enthusiast.jpg";
// Wedding templates
import wedMinimalMonogram from "@/assets/templates/wed-minimal-monogram.jpg";
import wedPhotoArchFloral from "@/assets/templates/wed-photo-arch-floral.jpg";
import wedBotanicalElegant from "@/assets/templates/wed-botanical-elegant.jpg";
import wedCongratulationsScript from "@/assets/templates/wed-congratulations-script.jpg";
import wedRusticPhotoFrame from "@/assets/templates/wed-rustic-photo-frame.jpg";
// New Baby templates
import nbCloudsAndStars from "@/assets/templates/nb-clouds-and-stars.jpg";
import nbPhotoMobile from "@/assets/templates/nb-photo-mobile.jpg";
import nbStorkAnnouncement from "@/assets/templates/nb-stork-announcement.jpg";
import nbFootprints from "@/assets/templates/nb-footprints.jpg";
import nbNurseryPhotoFrame from "@/assets/templates/nb-nursery-photo-frame.jpg";
// Condolence templates
import condolenceMutedFloral from "@/assets/templates/condolence-muted-floral.jpg";
import condolenceLandscape from "@/assets/templates/condolence-landscape.jpg";
import condolenceSimpleScript from "@/assets/templates/condolence-simple-script.jpg";
import condolenceWildflowers from "@/assets/templates/condolence-wildflowers.jpg";
import condolenceSympathyBorder from "@/assets/templates/condolence-sympathy-border.jpg";

export type OccasionSlug =
  | "mothers-day"
  | "easter"
  | "fathers-day"
  | "weddings"
  | "new-baby"
  | "condolences";

export type TemplateStyle =
  | "photo-upload"
  | "funny"
  | "traditional"
  | "minimal"
  | "floral"
  | "bold-typography"
  | "handwritten"
  | "cute"
  | "elegant";

export type LayoutType = "single-photo-oval" | "single-photo-rect" | "single-photo-arch" | "text-only" | "multi-photo";

export interface TemplateCard {
  id: string;
  name: string;
  shortDescription: string;
  primaryStyle: TemplateStyle;
  secondaryStyles?: TemplateStyle[];
  imageUrl: string;
  tags: string[];
  layoutType: LayoutType;
}

export interface Occasion {
  slug: OccasionSlug;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  highlightText?: string;
  templates: TemplateCard[];
}

export const OCCASIONS: Occasion[] = [
  {
    slug: "mothers-day",
    name: "Mother's Day",
    heroTitle: "Mother's Day Card Templates",
    heroSubtitle:
      "Soft florals, heartfelt typography and playful photo-upload designs inspired by popular card and template sites.",
    heroImageUrl: mothersDayImg,
    highlightText:
      "Choose from elegant florals, photo collages, and cheeky “best mum ever” styles.",
    templates: [
      {
        id: "md-floral-photo-collage",
        name: "Floral Photo Collage",
        shortDescription:
          "Four-photo grid framed with painterly flowers, perfect for favourite family memories.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["floral", "handwritten"],
        imageUrl: mdFloralCanvasFront,
        tags: ["photo upload", "floral", "sentimental"],
        layoutType: "multi-photo",
      },
      {
        id: "md-bold-best-mum",
        name: 'Bold "Best Mum Ever"',
        shortDescription:
          "Bright block typography with soft pastel background for a modern, design-led look.",
        primaryStyle: "bold-typography",
        secondaryStyles: ["minimal"],
        imageUrl: mdBoldBestMum,
        tags: ["modern", "typography"],
        layoutType: "text-only",
      },
      {
        id: "md-funny-tech-support",
        name: "Mum Tech Support",
        shortDescription:
          "Playful illustrated “family tech support” gag in a friendly handwritten style.",
        primaryStyle: "funny",
        secondaryStyles: ["handwritten"],
        imageUrl: mdFunnyTechSupport,
        tags: ["funny", "illustrated"],
        layoutType: "text-only",
      },
      {
        id: "md-watercolour-bouquet",
        name: "Watercolour Bouquet",
        shortDescription:
          "Delicate watercolour flowers with space for a heartfelt message inside.",
        primaryStyle: "floral",
        secondaryStyles: ["traditional"],
        imageUrl: mdWatercolourBouquet,
        tags: ["elegant", "classic"],
        layoutType: "text-only",
      },
      {
        id: "md-photo-oval-frame",
        name: "Oval Photo Frame",
        shortDescription:
          "Single portrait photo in an oval frame surrounded by soft florals.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["floral"],
        imageUrl: mdPhotoOvalFrame,
        tags: ["photo upload", "sentimental"],
        layoutType: "single-photo-oval",
      },
    ],
  },
  {
    slug: "easter",
    name: "Easter",
    heroTitle: "Easter Card Templates",
    heroSubtitle:
      "Soft pastels, spring florals, and playful illustrated bunnies and eggs for all ages.",
    heroImageUrl: easterImg,
    highlightText: "From minimalist crosses to cute bunnies and egg-hunt scenes.",
    templates: [
      {
        id: "easter-pastel-eggs-grid",
        name: "Pastel Eggs Grid",
        shortDescription:
          "Clean grid of illustrated eggs in pastel tones, with a simple “Happy Easter” headline.",
        primaryStyle: "minimal",
        secondaryStyles: ["cute"],
        imageUrl: easterPastelEggs,
        tags: ["pastel", "minimal", "modern"],
        layoutType: "text-only",
      },
      {
        id: "easter-bunny-photo-frame",
        name: "Bunny Photo Frame",
        shortDescription:
          "Single photo framed with illustrated bunny ears and spring flowers for kid-friendly designs.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["cute", "floral"],
        imageUrl: easterBunnyFrame,
        tags: ["photo upload", "kids"],
        layoutType: "single-photo-rect",
      },
      {
        id: "easter-spring-florals",
        name: "Spring Florals",
        shortDescription:
          "Watercolour daffodils and tulips with a gentle “Happy Easter” message.",
        primaryStyle: "floral",
        secondaryStyles: ["traditional"],
        imageUrl: easterSpringFlorals,
        tags: ["spring", "elegant"],
        layoutType: "text-only",
      },
      {
        id: "easter-minimal-cross",
        name: "Minimal Cross",
        shortDescription:
          "Simple line-art cross with soft pastel background for a respectful design.",
        primaryStyle: "minimal",
        secondaryStyles: [],
        imageUrl: easterMinimalCross,
        tags: ["minimal", "faith"],
        layoutType: "text-only",
      },
      {
        id: "easter-egg-hunt",
        name: "Egg Hunt Fun",
        shortDescription:
          "Playful illustrated scene of bunnies and hidden eggs for the whole family.",
        primaryStyle: "cute",
        secondaryStyles: ["funny"],
        imageUrl: easterEggHunt,
        tags: ["kids", "playful"],
        layoutType: "text-only",
      },
    ],
  },
  {
    slug: "fathers-day",
    name: "Father's Day",
    heroTitle: "Father's Day Card Templates",
    heroSubtitle:
      "Bold typography, hobby-themed illustrations and witty slogans for every kind of dad.",
    heroImageUrl: fathersDayImg,
    highlightText:
      "Celebrate dads, step-dads and father-figures with fun or heartfelt designs.",
    templates: [
      {
        id: "fd-bold-super-dad",
        name: "Bold Super Dad",
        shortDescription:
          "Strong sans-serif “Super Dad” headline with geometric shapes and deep blue palette.",
        primaryStyle: "bold-typography",
        secondaryStyles: ["minimal"],
        imageUrl: fdBoldSuperDad,
        tags: ["modern", "graphic"],
        layoutType: "text-only",
      },
      {
        id: "fd-grill-king",
        name: "Grill King",
        shortDescription:
          "Illustrated BBQ tools and flames with a tongue-in-cheek “Grill King” message.",
        primaryStyle: "funny",
        secondaryStyles: [],
        imageUrl: fdGrillKing,
        tags: ["funny", "hobby", "bbq"],
        layoutType: "text-only",
      },
      {
        id: "fd-tools-and-ties",
        name: "Tools & Ties",
        shortDescription:
          "Classic illustrated tools and ties with a heartfelt “Best Dad” message.",
        primaryStyle: "traditional",
        secondaryStyles: ["handwritten"],
        imageUrl: fdToolsAndTies,
        tags: ["classic", "heartfelt"],
        layoutType: "text-only",
      },
      {
        id: "fd-photo-collage",
        name: "Dad Photo Collage",
        shortDescription:
          "Multi-photo layout with bold typography for a personalised tribute.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["bold-typography"],
        imageUrl: fdPhotoCollage,
        tags: ["photo upload", "personal"],
        layoutType: "multi-photo",
      },
      {
        id: "fd-golf-hobby",
        name: "Golf Enthusiast",
        shortDescription:
          "Illustrated golf clubs and balls with a witty “Fore the Best Dad” pun.",
        primaryStyle: "funny",
        secondaryStyles: [],
        imageUrl: fdGolfEnthusiast,
        tags: ["funny", "hobby"],
        layoutType: "text-only",
      },
    ],
  },
  {
    slug: "weddings",
    name: "Weddings",
    heroTitle: "Wedding Card Templates",
    heroSubtitle:
      "Elegant typography, soft florals and photo-focused layouts for wedding congratulations.",
    heroImageUrl: weddingImg,
    highlightText: "From save-the-date looks to refined congratulations cards.",
    templates: [
      {
        id: "wed-minimal-monogram",
        name: "Minimal Monogram",
        shortDescription:
          "Clean white layout with couple's initials in a serif monogram and subtle border.",
        primaryStyle: "minimal",
        secondaryStyles: ["elegant"],
        imageUrl: wedMinimalMonogram,
        tags: ["elegant", "classic"],
        layoutType: "text-only",
      },
      {
        id: "wed-photo-arch-floral",
        name: "Arched Photo with Florals",
        shortDescription:
          "Single large photo in an arched frame with watercolor florals around the border.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["floral"],
        imageUrl: wedPhotoArchFloral,
        tags: ["photo upload", "romantic"],
        layoutType: "single-photo-arch",
      },
      {
        id: "wed-botanical-elegant",
        name: "Botanical Elegance",
        shortDescription:
          "Delicate botanical illustrations with gold foil accents and serif typography.",
        primaryStyle: "elegant",
        secondaryStyles: ["floral"],
        imageUrl: wedBotanicalElegant,
        tags: ["luxury", "botanical"],
        layoutType: "text-only",
      },
      {
        id: "wed-congratulations-script",
        name: "Congratulations Script",
        shortDescription:
          "Elegant script typography with soft blush and ivory colour palette.",
        primaryStyle: "handwritten",
        secondaryStyles: ["elegant"],
        imageUrl: wedCongratulationsScript,
        tags: ["script", "romantic"],
        layoutType: "text-only",
      },
      {
        id: "wed-photo-mason-jar",
        name: "Rustic Photo Frame",
        shortDescription:
          "Photo frame with soft florals and a rustic, romantic feel.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["floral"],
        imageUrl: wedRusticPhotoFrame,
        tags: ["photo upload", "rustic"],
        layoutType: "single-photo-rect",
      },
    ],
  },
  {
    slug: "new-baby",
    name: "New Baby",
    heroTitle: "New Baby Card Templates",
    heroSubtitle:
      "Soft, gentle palettes with clouds, stars and playful baby illustrations.",
    heroImageUrl: newBabyImg,
    highlightText:
      "Designs for baby girls, boys and gender-neutral celebrations.",
    templates: [
      {
        id: "nb-clouds-and-stars",
        name: "Clouds and Stars",
        shortDescription:
          "Dreamy cloud and star illustrations with a central “Welcome Little One” message.",
        primaryStyle: "cute",
        secondaryStyles: ["handwritten"],
        imageUrl: nbCloudsAndStars,
        tags: ["soft", "cute", "neutral"],
        layoutType: "text-only",
      },
      {
        id: "nb-photo-mobile",
        name: "Photo Mobile",
        shortDescription:
          "Three hanging photo frames styled like a baby mobile, with gentle pastel background.",
        primaryStyle: "photo-upload",
        secondaryStyles: [],
        imageUrl: nbPhotoMobile,
        tags: ["photo upload", "family"],
        layoutType: "multi-photo",
      },
      {
        id: "nb-stork-announcement",
        name: "Stork Announcement",
        shortDescription:
          "Classic stork illustration with space for baby details and name.",
        primaryStyle: "cute",
        secondaryStyles: ["traditional"],
        imageUrl: nbStorkAnnouncement,
        tags: ["announcement", "classic"],
        layoutType: "text-only",
      },
      {
        id: "nb-footprints",
        name: "Tiny Footprints",
        shortDescription:
          "Gentle footprint illustration with soft pastels for a tender welcome.",
        primaryStyle: "cute",
        secondaryStyles: ["minimal"],
        imageUrl: nbFootprints,
        tags: ["soft", "minimal"],
        layoutType: "text-only",
      },
      {
        id: "nb-photo-nursery",
        name: "Nursery Photo Frame",
        shortDescription:
          "Photo frame with soft clouds and stars for newborn announcements.",
        primaryStyle: "photo-upload",
        secondaryStyles: ["cute"],
        imageUrl: nbNurseryPhotoFrame,
        tags: ["photo upload", "newborn"],
        layoutType: "single-photo-rect",
      },
    ],
  },
  {
    slug: "condolences",
    name: "Condolences",
    heroTitle: "Condolence & Sympathy Card Templates",
    heroSubtitle:
      "Understated, respectful designs with muted colours and simple typography.",
    heroImageUrl: condolencesImg,
    highlightText: "Gentle layouts for sending thoughtful messages of support.",
    templates: [
      {
        id: "condolence-muted-floral",
        name: "Muted Florals",
        shortDescription:
          "Soft greys and lavender florals with a simple, sincere condolence message.",
        primaryStyle: "floral",
        secondaryStyles: ["minimal"],
        imageUrl: condolenceMutedFloral,
        tags: ["soft", "respectful"],
        layoutType: "text-only",
      },
      {
        id: "condolence-landscape",
        name: "Calm Landscape",
        shortDescription:
          "Subtle painted landscape with lots of white space and quiet serif typography.",
        primaryStyle: "traditional",
        secondaryStyles: ["minimal"],
        imageUrl: condolenceLandscape,
        tags: ["traditional", "peaceful"],
        layoutType: "text-only",
      },
      {
        id: "condolence-simple-script",
        name: "Simple Script",
        shortDescription:
          "Minimal design with elegant script and plenty of white space.",
        primaryStyle: "minimal",
        secondaryStyles: ["handwritten"],
        imageUrl: condolenceSimpleScript,
        tags: ["elegant", "simple"],
        layoutType: "text-only",
      },
      {
        id: "condolence-wildflowers",
        name: "Wildflowers",
        shortDescription:
          "Soft wildflower illustration with a gentle, comforting message.",
        primaryStyle: "floral",
        secondaryStyles: ["traditional"],
        imageUrl: condolenceWildflowers,
        tags: ["nature", "gentle"],
        layoutType: "text-only",
      },
      {
        id: "condolence-sympathy-border",
        name: "Sympathy Border",
        shortDescription:
          "Classic bordered design with serif typography for formal condolences.",
        primaryStyle: "traditional",
        secondaryStyles: ["elegant"],
        imageUrl: condolenceSympathyBorder,
        tags: ["formal", "classic"],
        layoutType: "text-only",
      },
    ],
  },
];

/** Pick a template that fits: single-photo layouts when user has one photo, text-only or single-photo when no photo; never multi-photo for one photo. */
export function pickBestTemplate(occasion: Occasion, hasPhoto: boolean): TemplateCard {
  const singlePhotoTypes: LayoutType[] = ["single-photo-oval", "single-photo-rect", "single-photo-arch"];
  const candidates = hasPhoto
    ? occasion.templates.filter((t) => singlePhotoTypes.includes(t.layoutType))
    : occasion.templates.filter((t) => t.layoutType === "text-only" || singlePhotoTypes.includes(t.layoutType));
  if (candidates.length > 0) return candidates[0];
  return occasion.templates[0];
}
