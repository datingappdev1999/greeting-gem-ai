import type { TextStyle } from "@/types/cardTemplate";

/** Map template tokens to valid CSS font-weight values. */
export function fontWeightToCss(w: TextStyle["fontWeight"]): number {
  switch (w) {
    case "light":
      return 300;
    case "normal":
      return 400;
    case "medium":
      return 500;
    case "semibold":
      return 600;
    case "bold":
      return 700;
  }
}
