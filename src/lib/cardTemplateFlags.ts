/** Templates with no editable front headline in the panel and no rendered headline on the card front. */
const HIDE_FRONT_HEADLINE_TEMPLATE_IDS = new Set<string>([
  "easter-minimal-cross",
  "easter-egg-hunt",
]);

export function templateHidesFrontHeadline(id: string): boolean {
  return HIDE_FRONT_HEADLINE_TEMPLATE_IDS.has(id);
}
