import type { Beer } from "../types";

export type Comment = {
  id: string;
  text: string;
  author?: string;
};

// Generate sample comments for testing
// In a real implementation, these would come from the beer data
export const generateSampleComments = (beer: Beer): Comment[] => {
  // Use beer properties to generate semi-realistic comments
  const comments: Comment[] = [
    {
      id: `${beer.entryId}-1`,
      text: `Great ${beer.style || "beer"} with excellent balance`,
      author: "Judge 1",
    },
    {
      id: `${beer.entryId}-2`,
      text: `Beautiful color and aroma`,
      author: "Judge 2",
    },
    {
      id: `${beer.entryId}-3`,
      text: `${beer.name} has a wonderful finish`,
      author: "Judge 3",
    },
    {
      id: `${beer.entryId}-4`,
      text: `Great ${beer.style || "beer"} with excellent balance`,
      author: "Judge 1",
    },
    {
      id: `${beer.entryId}-5`,
      text: `Beautiful color and aroma`,
      author: "Judge 2",
    },
    {
      id: `${beer.entryId}-6`,
      text: `${beer.name} has a wonderful finish`,
      author: "Judge 3",
    },
  ];

  // Add some style-specific comments if style is available
  if (beer.style) {
    const styleLower = beer.style.toLowerCase();

    if (styleLower.includes("ipa")) {
      comments.push({
        id: `${beer.entryId}-7`,
        text: "Bold hop character with citrus notes",
        author: "Judge 1",
      });
    } else if (styleLower.includes("stout") || styleLower.includes("porter")) {
      comments.push({
        id: `${beer.entryId}-7`,
        text: "Rich roasted malt flavors with coffee undertones",
        author: "Judge 2",
      });
    } else if (styleLower.includes("wheat") || styleLower.includes("weiss")) {
      comments.push({
        id: `${beer.entryId}-7`,
        text: "Refreshing with classic wheat characteristics",
        author: "Judge 3",
      });
    }
  }

  return comments;
};
