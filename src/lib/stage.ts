import type { Competition, CompetitionStatus } from "../types";

export type GuestStage = {
  n: number;
  status: CompetitionStatus;
  label: string;
  hint: string;
  to: string | null;
};

const STAGES: Record<CompetitionStatus, GuestStage> = {
  draft: {
    n: 1,
    status: "draft",
    label: "Setting up",
    hint: "The flight isn’t poured yet.",
    to: null,
  },
  registration: {
    n: 2,
    status: "registration",
    label: "Enter a beer",
    hint: "Bring a bottle. We’ll number it.",
    to: "/register",
  },
  tasting: {
    n: 3,
    status: "tasting",
    label: "Score bottles",
    hint: "What’s in your glass?",
    to: "/",
  },
  closed: {
    n: 4,
    status: "closed",
    label: "Pencils down",
    hint: "Gather up — the reveal is next.",
    to: "/",
  },
  reveal: {
    n: 5,
    status: "reveal",
    label: "Watch the reveal",
    hint: "Winners are being called.",
    to: "/reveal",
  },
  published: {
    n: 6,
    status: "published",
    label: "See the ranking",
    hint: "The card is open.",
    to: "/results",
  },
};

export function guestStage(competition: Competition): GuestStage {
  const { status } = competition;
  if (status === "published" || status === "reveal" || status === "closed") {
    return STAGES[status];
  }
  if (competition.tastingOpen || status === "tasting") return STAGES.tasting;
  if (competition.registrationOpen || status === "registration") {
    return STAGES.registration;
  }
  return STAGES.draft;
}

export function pathMatchesStage(pathname: string, stage: GuestStage): boolean {
  if (!stage.to) return pathname === "/";
  if (stage.status === "tasting") {
    return pathname === "/" || pathname.startsWith("/t/");
  }
  if (stage.to === "/") return pathname === "/";
  return pathname === stage.to || pathname.startsWith(`${stage.to}/`);
}
