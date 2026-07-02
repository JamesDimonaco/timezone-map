// AdSense configuration. Slot IDs are public (they appear in the page source),
// so they live in code rather than env vars — no per-environment setup needed.
export const ADSENSE_CLIENT = "ca-pub-4648706958423925";

export const AD_SLOTS = {
  /** /time/[slug] city pages */
  "city-page": "2322848913",
  /** /time/[slug] "X to Y" comparison pages */
  "comparison-page": "7703966860",
  /** /compare team planner */
  "compare-planner": "7787727342",
  /** about, privacy, API docs, /time index */
  "static-pages": "1587939058",
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;
