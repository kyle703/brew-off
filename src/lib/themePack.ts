export type ThemeStory = {
  kicker: string;
  motto: string;
  when: string;
  where: string;
  defending: string;
};

export type ThemePack = {
  id: string;
  favicon?: string;
  wordmark?: boolean;
  story?: ThemeStory;
  reveal?: {
    intro: string;
    close: string;
    closeKicker: string;
    confetti: string[];
    confettiGrand: string[];
  };
};

const PACKS: Record<string, ThemePack> = {
  "2026": {
    id: "2026",
    favicon: "/themes/2026/favicon.svg",
    wordmark: true,
    story: {
      kicker: "The Tenth Brew Off",
      motto: "Great brews. Good people. One tradition.",
      when: "October 31, 2026 · 1:00 PM",
      where: "Andy & Steve’s · 1200 W 45th Street, Richmond",
      defending: "Defending spoon · Fall 2025 champion Andy Sims",
    },
    reveal: {
      intro: "Quiet in the woods. We’re calling the card.",
      close: "The spoon is claimed.",
      closeKicker: "That’s the night",
      confetti: ["#e07a28", "#d4a44a", "#8a6230", "#f3e6d0"],
      confettiGrand: ["#e07a28", "#f3e6d0", "#d4a44a", "#7a1f12"],
    },
  },
};

export function themePack(id: string | undefined | null): ThemePack | null {
  if (!id) return null;
  return PACKS[id] ?? null;
}
