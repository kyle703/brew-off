import { useState } from "react";
import CommentBubbles from "../components/CommentBubbles";

// Sample beer judging comments
const sampleComments = [
  {
    id: "c1",
    text: "Excellent balance of malt and hops with a clean finish",
    author: "Judge 1",
  },
  {
    id: "c2",
    text: "Beautiful amber color with a persistent head",
    author: "Judge 2",
  },
  {
    id: "c3",
    text: "Strong notes of caramel and toffee with a hint of chocolate",
    author: "Judge 3",
  },
  {
    id: "c4",
    text: "Crisp and refreshing with subtle citrus undertones",
    author: "Judge 1",
  },
  {
    id: "c5",
    text: "Perfect carbonation level, very drinkable",
    author: "Judge 2",
  },
  {
    id: "c6",
    text: "Impressive aroma with floral and pine notes",
    author: "Judge 3",
  },
  {
    id: "c7",
    text: "Well-attenuated with a dry finish that leaves you wanting more",
    author: "Judge 1",
  },
  {
    id: "c8",
    text: "Smooth mouthfeel with a pleasant lingering bitterness",
    author: "Judge 2",
  },
  {
    id: "c9",
    text: "Complex flavor profile that evolves as it warms",
    author: "Judge 3",
  },
  {
    id: "c10",
    text: "Excellent example of the style, true to traditional characteristics",
    author: "Judge 1",
  },
  {
    id: "c11",
    text: "Bold hop character without being overwhelming",
    author: "Judge 2",
  },
  {
    id: "c12",
    text: "Remarkable clarity and brilliant presentation",
    author: "Judge 3",
  },
];

export default function CommentTest() {
  const [active, setActive] = useState(true);
  const [maxBubbles, setMaxBubbles] = useState(3);
  const [displayDuration, setDisplayDuration] = useState(10000);
  const [spacerDuration, setSpacerDuration] = useState(1000);

  return (
    <div className="min-h-screen bg-slate-900 py-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 scroll-mt-20">
        <h1 className="text-4xl font-bold text-amber-200 mb-8 text-center">
          Comment Bubbles Test
        </h1>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-amber-200 mb-2">
                Active
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="ml-2"
                />
              </label>
            </div>
            <div>
              <label className="block text-amber-200 mb-2">
                Max Bubbles
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={maxBubbles}
                  onChange={(e) => setMaxBubbles(parseInt(e.target.value))}
                  className="ml-2"
                />
                <span className="ml-2">{maxBubbles}</span>
              </label>
            </div>
            <div>
              <label className="block text-amber-200 mb-2">
                Display Duration (seconds)
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="1000"
                  value={displayDuration}
                  onChange={(e) => setDisplayDuration(parseInt(e.target.value))}
                  className="ml-2"
                />
                <span className="ml-2">{displayDuration / 1000}s</span>
              </label>
            </div>
            <div>
              <label className="block text-amber-200 mb-2">
                Spacer Duration (seconds)
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="500"
                  value={spacerDuration}
                  onChange={(e) => setSpacerDuration(parseInt(e.target.value))}
                  className="ml-2"
                />
                <span className="ml-2">{spacerDuration / 1000}s</span>
              </label>
            </div>
          </div>
        </div>

        {/* Demo Container */}
        <div className="bg-slate-800 rounded-lg p-6 h-[600px] relative overflow-hidden border-4 border-amber-700">
          <CommentBubbles
            comments={sampleComments}
            active={active}
            maxBubbles={maxBubbles}
            displayDuration={displayDuration}
            spacerDuration={spacerDuration}
          />
        </div>

        {/* Comment List */}
        <div className="mt-12 bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-amber-200 mb-4">
            Sample Comments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleComments.map((comment) => (
              <div key={comment.id} className="bg-slate-700 p-3 rounded-lg">
                <p className="text-white">"{comment.text}"</p>
                <p className="text-amber-200 text-sm text-right">
                  — {comment.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
