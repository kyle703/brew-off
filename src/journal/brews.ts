export const BREWS = [
  {
    slug: "hokie-smash",
    name: "Hokie Smash",
    style: "Hazy-leaning West Coast IPA",
    styleFamily: "India Pale Ale",
    abvLabel: "6.9%",
    abvActual: "6.8%",
    og: "1.060",
    fg: "1.008",
    brewed: "Sep 2026",
    place: "Richmond",
    summary:
      "First all-grain. Foundry 6.5, 15 lb, no pump. 1.060 to 1.008. 6.8% actual, 6.9% on the label. Mash efficiency ~51%.",
    nextTime:
      "Leak-test the fermenter, mark a volume dipstick, and stop packing 15 lb into this basket.",
    label: "/journal/hokie-smash/label.jpg",
    theme: {
      bg: "#4A0E16",
      ink: "#F6E2B4",
      accent: "#F25B0A",
    },
  },
] as const;

export type BrewSlug = (typeof BREWS)[number]["slug"];
export type BrewSummary = (typeof BREWS)[number];

export const STYLE_NOTES: Record<string, string> = {};

export function styleId(family: string) {
  return `style-${family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

export function brewChapters(brews: readonly BrewSummary[]) {
  const order: string[] = [];
  const groups = new Map<string, BrewSummary[]>();
  for (const brew of brews) {
    const list = groups.get(brew.styleFamily);
    if (!list) {
      order.push(brew.styleFamily);
      groups.set(brew.styleFamily, [brew]);
    } else {
      list.push(brew);
    }
  }
  return order.map((family) => ({
    family,
    id: styleId(family),
    note: STYLE_NOTES[family] ?? "",
    brews: groups.get(family) ?? [],
  }));
}
