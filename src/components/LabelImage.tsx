import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function LabelImage({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-rule/30 text-[10px] uppercase tracking-wide text-muted ${className}`}
      >
        No label
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
