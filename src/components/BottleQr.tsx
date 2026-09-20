import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { useSession } from "../context/Session";
import { qrColors, themedQrOptions } from "../lib/qr";

type Props = {
  url: string;
  size?: number;
  className?: string;
};

export default function BottleQr({ url, size = 180, className = "" }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const painted = useRef("");
  const { bootstrap } = useSession();
  const themeId = bootstrap?.competition.themeId ?? "";

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const colors = qrColors();
    const key = `${url}|${size}|${themeId}|${colors.fg}|${colors.bg}|${colors.accent}`;
    if (painted.current === key && node.childElementCount > 0) return;
    painted.current = key;
    node.replaceChildren();
    const qr = new QRCodeStyling(themedQrOptions(url, size));
    qr.append(node);
  }, [url, size, themeId]);

  return (
    <div
      className={className}
      ref={host}
      style={{ width: size, height: size }}
    />
  );
}
