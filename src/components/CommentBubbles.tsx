import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Comment = {
  id: string;
  text: string;
  author?: string;
};

type VisibleComment = Comment & {
  position: { x: number; y: number };
};

type Props = {
  comments: Comment[];
  active?: boolean;
  maxBubbles?: number;
  displayDuration?: number;
  spacerDuration?: number;
};

/**
 * Component that displays comments as animated text bubbles
 * that fade in and out at random positions within a container
 */
export default function CommentBubbles({
  comments,
  active = true,
  maxBubbles = 1,
  displayDuration = 10000, // 10 seconds
  spacerDuration = 1000, // 1 second between bubbles
}: Props) {
  const [visibleComments, setVisibleComments] = useState<VisibleComment[]>([]);
  const [usedCommentIds, setUsedCommentIds] = useState<Set<string>>(new Set());
  const [nextCommentIndex, setNextCommentIndex] = useState(0);
  const [totalCommentsCreated, setTotalCommentsCreated] = useState(0);

  // Use refs to store the latest values without triggering effect reruns
  const activeRef = useRef(active);
  const commentsRef = useRef(comments);
  const maxBubblesRef = useRef(maxBubbles);
  const displayDurationRef = useRef(displayDuration);
  const spacerDurationRef = useRef(spacerDuration);
  const usedCommentIdsRef = useRef(usedCommentIds);
  const nextCommentIndexRef = useRef(nextCommentIndex);
  const visibleCommentsRef = useRef(visibleComments);
  const totalCommentsCreatedRef = useRef(totalCommentsCreated);

  // Update refs when props change
  useEffect(() => {
    activeRef.current = active;
    commentsRef.current = comments;
    maxBubblesRef.current = maxBubbles;
    displayDurationRef.current = displayDuration;
    spacerDurationRef.current = spacerDuration;
  }, [active, comments, maxBubbles, displayDuration, spacerDuration]);

  // Update refs when state changes
  useEffect(() => {
    usedCommentIdsRef.current = usedCommentIds;
  }, [usedCommentIds]);

  useEffect(() => {
    nextCommentIndexRef.current = nextCommentIndex;
  }, [nextCommentIndex]);

  useEffect(() => {
    visibleCommentsRef.current = visibleComments;
  }, [visibleComments]);

  useEffect(() => {
    totalCommentsCreatedRef.current = totalCommentsCreated;
  }, [totalCommentsCreated]);

  // Refs to store timer IDs for cleanup
  const initialTimerRef = useRef<number | null>(null);
  const removalTimerRef = useRef<number | null>(null);
  const nextTimerRef = useRef<number | null>(null);

  // Generate fixed grid positions below the hero card
  const getGridPosition = useCallback(() => {
    // Create a 3-column grid below the hero card
    const gridPositions = [
      { x: 20, y: 105 }, // Left column
      { x: 50, y: 105 }, // Center column
      { x: 80, y: 105 }, // Right column
    ];

    // Round-robin based on total comments created, not currently visible
    const nextIndex = totalCommentsCreatedRef.current % gridPositions.length;
    return gridPositions[nextIndex];
  }, []);

  // Add jitter to timing to prevent synchronization
  const getJitteredDuration = (baseDuration: number) => {
    const jitter = 0.3; // ±30% variation
    const variation = (Math.random() - 0.5) * jitter;
    return baseDuration * (1 + variation);
  };

  // Function to add the next comment
  const addNextComment = useCallback(() => {
    // Use ref values to avoid dependency issues
    const currentActive = activeRef.current;
    const currentComments = commentsRef.current;
    const currentMaxBubbles = maxBubblesRef.current;
    const currentDisplayDuration = displayDurationRef.current;
    const currentSpacerDuration = spacerDurationRef.current;

    if (!currentActive || currentComments.length === 0) return;

    console.log("Adding next comment", {
      visibleCount: visibleCommentsRef.current.length,
      usedCount: usedCommentIdsRef.current.size,
      nextIndex: nextCommentIndexRef.current,
      totalComments: currentComments.length,
      maxBubbles: currentMaxBubbles,
    });

    // If we've shown all comments, reset
    if (usedCommentIdsRef.current.size >= currentComments.length) {
      setUsedCommentIds(new Set());
      setNextCommentIndex(0);
    }

    // Find the next unused comment
    let nextIndex = nextCommentIndexRef.current;
    let loopCount = 0;

    // Look for a comment that's not currently visible AND not recently used
    while (loopCount < currentComments.length) {
      const candidateComment = currentComments[nextIndex];

      // Check if this comment is currently visible
      const isCurrentlyVisible = visibleCommentsRef.current.some(
        (visible) => visible.id === candidateComment.id
      );

      // Check if this comment was recently used
      const wasRecentlyUsed = usedCommentIdsRef.current.has(
        candidateComment.id
      );

      // If comment is neither visible nor recently used, we can use it
      if (!isCurrentlyVisible && !wasRecentlyUsed) {
        break;
      }

      nextIndex = (nextIndex + 1) % currentComments.length;
      loopCount++;
    }

    // If we couldn't find a suitable comment, reset and try again
    if (loopCount >= currentComments.length) {
      setUsedCommentIds(new Set());
      setNextCommentIndex(0);
      nextIndex = 0;
    }

    const nextComment = currentComments[nextIndex];
    if (!nextComment) return;

    const position = getGridPosition();

    // Add to visible comments with position
    setVisibleComments((prev) => {
      // If we've reached max bubbles, remove the oldest one
      const newComments = [...prev];
      if (newComments.length >= currentMaxBubbles) {
        newComments.shift();
      }
      return [...newComments, { ...nextComment, position } as VisibleComment];
    });

    // Increment total comments created for round-robin positioning
    setTotalCommentsCreated((prev) => prev + 1);

    // Mark as used
    setUsedCommentIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(nextComment.id);
      return newSet;
    });

    // Update next index
    setNextCommentIndex((nextIndex + 1) % currentComments.length);

    // Schedule removal with jittered duration
    const jitteredDisplayDuration = getJitteredDuration(currentDisplayDuration);
    const removalTimer = window.setTimeout(() => {
      setVisibleComments((prev) =>
        prev.filter((comment) => comment.id !== nextComment.id)
      );
    }, jitteredDisplayDuration);

    // Store the timer ID in a ref for cleanup
    removalTimerRef.current = removalTimer;

    // Schedule next comment with jittered spacer duration
    const jitteredSpacerDuration = getJitteredDuration(currentSpacerDuration);
    const nextCommentTimer = window.setTimeout(() => {
      addNextComment();
    }, jitteredSpacerDuration);

    // Store the timer ID in a ref for cleanup
    nextTimerRef.current = nextCommentTimer;
  }, [getGridPosition]);

  // Reset when comments change or component becomes inactive
  useEffect(() => {
    // Clear any existing timers
    if (initialTimerRef.current) window.clearTimeout(initialTimerRef.current);
    if (removalTimerRef.current) window.clearTimeout(removalTimerRef.current);
    if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);

    // Reset state
    if (!active || comments.length === 0) {
      setVisibleComments([]);
      setUsedCommentIds(new Set());
      setNextCommentIndex(0);
      return;
    }

    // Start the comment display cycle with jittered initial delay
    const initialDelay = getJitteredDuration(500); // 500ms ± 30% variation
    initialTimerRef.current = window.setTimeout(() => {
      addNextComment();
    }, initialDelay);

    // Cleanup function
    return () => {
      if (initialTimerRef.current) window.clearTimeout(initialTimerRef.current);
      if (removalTimerRef.current) window.clearTimeout(removalTimerRef.current);
      if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
    };
  }, [comments, active, addNextComment]);

  // Get a random background color from a set of soft colors
  const getBubbleColor = (commentId: string) => {
    // Use the comment ID to deterministically select a color
    const colors = [
      "bg-blue-100",
      "bg-amber-100",
      "bg-emerald-100",
      "bg-indigo-100",
      "bg-rose-100",
      "bg-cyan-100",
    ];
    const index = commentId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <AnimatePresence>
        {visibleComments.map((comment) => {
          const bubbleColor = getBubbleColor(comment.id);

          return (
            <motion.div
              key={comment.id}
              className={`absolute max-w-[25%] ${bubbleColor} p-3 rounded-xl shadow-lg z-10`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: `${comment.position.x}%`,
                top: `${comment.position.y}%`,
                translateX: "-50%",
                translateY: "-50%",
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg md:text-xl font-bold text-slate-800 leading-tight">
                "{comment.text}"
              </p>
              {comment.author && (
                <p className="text-right text-xs md:text-sm mt-2 font-medium text-slate-600">
                  — {comment.author}
                </p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
