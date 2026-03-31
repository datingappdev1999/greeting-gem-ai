/** Templates with no editable front headline in the panel and no rendered headline on the card front. */
const HIDE_FRONT_HEADLINE_TEMPLATE_IDS = new Set<string>([
  "easter-minimal-cross",
  "easter-egg-hunt",
  "bd-text-bottom-florals",
]);

export function templateHidesFrontHeadline(id: string): boolean {
  // Father's Day editing flow should not show front headline controls/text.
  if (id.startsWith("fd-")) return true;
  // Birthday cards should use artwork-first fronts without editable headline controls/text.
  if (id.startsWith("bd-")) return true;
  return HIDE_FRONT_HEADLINE_TEMPLATE_IDS.has(id);
}
