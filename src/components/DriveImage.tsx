import { useMemo, useState } from "react";
import { extractDriveFileId } from "../data/drive";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  driveIdOrUrl: string;
};

// Attempts a sequence of public URL patterns to avoid 403s.
const buildCandidates = (idOrUrl: string): string[] => {
  const id = extractDriveFileId(idOrUrl);
  return [
    // googleusercontent (preferred)
    `https://lh3.googleusercontent.com/d/${id}=w1200`,
    `https://lh3.googleusercontent.com/u/0/d/${id}=w1200`,
    `https://lh3.googleusercontent.com/d/${id}`,
    // uc?export=view (commonly works)
    `https://drive.google.com/uc?export=view&id=${id}`,
    // file view page (relies on referrer relax + CSP image-src 'unsafe')
    `https://drive.google.com/thumbnail?authuser=0&sz=w1200&id=${id}`,
  ];
};

export default function DriveImage({ driveIdOrUrl, ...imgProps }: Props) {
  const urls = useMemo(() => buildCandidates(driveIdOrUrl), [driveIdOrUrl]);
  const [idx, setIdx] = useState(0);

  const onError: React.ReactEventHandler<HTMLImageElement> = () => {
    setIdx((i) => (i + 1 < urls.length ? i + 1 : i));
  };

  return (
    <img
      {...imgProps}
      src={urls[idx]}
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}
