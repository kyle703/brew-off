export function fmtScore(n: number | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function placeWord(place: 1 | 2 | 3, champion: boolean): string {
  if (champion && place === 1) return "Champion";
  if (place === 1) return "First";
  if (place === 2) return "Second";
  return "Third";
}
