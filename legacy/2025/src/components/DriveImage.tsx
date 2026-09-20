type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  driveIdOrUrl: string;
};

/**
 * Component for displaying Google Drive images
 * Now using direct CDN URLs transformed during data loading
 */
export default function DriveImage({ driveIdOrUrl, ...imgProps }: Props) {
  return (
    <img
      {...imgProps}
      src={driveIdOrUrl}
      referrerPolicy="no-referrer"
      onError={(e) => {
        console.error("Failed to load image:", driveIdOrUrl);
        // Set a fallback or placeholder if image fails to load
        e.currentTarget.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='1'%3E%3Cpath d='M5 22h14a2 2 0 0 0 2-2V9a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1V1a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2z'/%3E%3C/svg%3E";
      }}
    />
  );
}
