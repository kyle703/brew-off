import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { useSession } from "../context/Session";

type Props = {
  url: string;
  size?: number;
  className?: string;
};

function qrColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    fg: styles.getPropertyValue("--qr-fg").trim() || "#1c1916",
    bg: styles.getPropertyValue("--qr-bg").trim() || "#f4efe4",
    accent: styles.getPropertyValue("--qr-accent").trim() || "#8a6a2f",
  };
}

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
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: url,
      dotsOptions: { color: colors.fg, type: "rounded" },
      backgroundOptions: { color: colors.bg },
      cornersSquareOptions: { type: "extra-rounded", color: colors.accent },
      cornersDotOptions: { type: "dot", color: colors.accent },
    });
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
