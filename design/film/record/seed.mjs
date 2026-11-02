// Synthetic My Reflection history so the donut has something to show (labels only, the same
// format the app saves; no text, no API). Shown in the film as demo data. Mixes are spread
// so 7 vs 30 days look different without suggesting any "progress".
const DAY = 864e5;
const MIX = [
  [3, ["cp", "ac", "a", "cp"]], [5, ["a", "fc", "np"]], [9, ["ac", "ac", "cp", "a"]], [12, ["fc", "a", "cp"]],
  [16, ["np", "a", "ac"]], [20, ["cp", "cp", "fc", "a"]], [24, ["a", "np", "ac", "fc"]], [27, ["ac", "cp", "a"]],
];
const TITLES = ["Jordan – Alex – 01", "Sam – Alex – 01", "Mom – Alex – 01", "Jordan – Alex – 02", "Riley – Alex – 01", "Jordan – Alex – 03", "Team – Alex – 01", "Jordan – Alex – 04"];

export function seedCollections(now = Date.now()) {
  return MIX.map(([daysAgo, states], i) => ({
    v: 1, id: `seed${i + 1}`, createdAt: new Date(now - daysAgo * DAY).toISOString(), lang: "en", title: TITLES[i], note: "",
    mine: states.map((s, order) => ({ order, ai: s, chosen: order === 1 ? s : null })),
  }));
}
