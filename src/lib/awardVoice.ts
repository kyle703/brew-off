export type AwardVoice = {
  kicker: string;
  title: string;
  tease: string;
  third: string;
  second: string;
  first: string;
  champion: string;
  atmosphere: string;
  decor: "frame" | "liquid" | "bubbles" | "steam" | "rays" | "none";
  enter: "stamp" | "pour" | "bounce" | "linger" | "crown";
};

const FALLBACK: AwardVoice = {
  kicker: "Award",
  title: "The mark",
  tease: "One more from the card.",
  third: "Third",
  second: "Second",
  first: "First",
  champion: "Champion",
  atmosphere: "voice-plain",
  decor: "none",
  enter: "linger",
};

const VOICES: Record<string, AwardVoice> = {
  label: {
    kicker: "Before a sip",
    title: "The look",
    tease: "The poster you’d steal off the fridge.",
    third: "Honorable hanging",
    second: "Almost the cover",
    first: "The one on the wall",
    champion: "The one on the wall",
    atmosphere: "voice-label",
    decor: "frame",
    enter: "stamp",
  },
  color: {
    kicker: "Hold it to the light",
    title: "In the glass",
    tease: "Tilt it. That’s the whole argument.",
    third: "A nice pour",
    second: "Caught the lamp",
    first: "Could drink it with your eyes",
    champion: "Could drink it with your eyes",
    atmosphere: "voice-color",
    decor: "liquid",
    enter: "pour",
  },
  drinkability: {
    kicker: "Another round",
    title: "The easy one",
    tease: "Gone before you finished the story.",
    third: "Would have another",
    second: "Already empty",
    first: "Session royalty",
    champion: "Session royalty",
    atmosphere: "voice-drink",
    decor: "bubbles",
    enter: "bounce",
  },
  flavor: {
    kicker: "The sip",
    title: "What lingered",
    tease: "Not a stunt. A finish that followed you.",
    third: "A good story",
    second: "Still on the tongue",
    first: "The one that stayed",
    champion: "The one that stayed",
    atmosphere: "voice-flavor",
    decor: "steam",
    enter: "linger",
  },
  overall: {
    kicker: "The whole card",
    title: "Grand champion",
    tease: "One beer to take home in your head.",
    third: "On the step",
    second: "This close",
    first: "Champion",
    champion: "The one",
    atmosphere: "voice-overall",
    decor: "rays",
    enter: "crown",
  },
};

export function awardVoice(id: string, fallbackLabel?: string): AwardVoice {
  const found = VOICES[id];
  if (found) return found;
  return {
    ...FALLBACK,
    title: fallbackLabel || FALLBACK.title,
  };
}

export function placeLine(
  voice: AwardVoice,
  place: 1 | 2 | 3,
  champion: boolean,
): string {
  if (champion && place === 1) return voice.champion;
  if (place === 1) return voice.first;
  if (place === 2) return voice.second;
  return voice.third;
}
