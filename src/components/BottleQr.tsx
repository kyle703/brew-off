import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

type Props = {
  url: string;
  size?: number;
  className?: string;
};

export default function BottleQr({ url, size = 180, className = "" }: Props) {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!host.current) return;
    host.current.innerHTML = "";
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: url,
      dotsOptions: { color: "#1c1916", type: "rounded" },
      backgroundOptions: { color: "#f4efe4" },
      cornersSquareOptions: { type: "extra-rounded", color: "#8a6a2f" },
      cornersDotOptions: { type: "dot", color: "#8a6a2f" },
    });
    qr.append(host.current);
  }, [url, size]);

  return <div className={className} ref={host} />;
}
