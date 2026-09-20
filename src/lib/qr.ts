import QRCodeStyling from "qr-code-styling";

export function qrColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    fg: styles.getPropertyValue("--qr-fg").trim() || "#1c1916",
    bg: styles.getPropertyValue("--qr-bg").trim() || "#f4efe4",
    accent: styles.getPropertyValue("--qr-accent").trim() || "#8a6a2f",
  };
}

export function themedQrOptions(url: string, size: number) {
  const colors = qrColors();
  return {
    width: size,
    height: size,
    data: url,
    type: "canvas",
    dotsOptions: { color: colors.fg, type: "rounded" },
    backgroundOptions: { color: colors.bg },
    cornersSquareOptions: { type: "extra-rounded", color: colors.accent },
    cornersDotOptions: { type: "dot", color: colors.accent },
  };
}

export function fileSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "qr"
  );
}

export async function saveThemedQr(url: string, filename: string) {
  const qr = new QRCodeStyling({
    ...themedQrOptions(url, 1400),
    margin: 48,
    qrOptions: { errorCorrectionLevel: "H" },
  });
  const raw = await qr.getRawData("png");
  const blob = raw instanceof Blob ? raw : null;
  if (!blob) {
    await qr.download({
      name: filename.replace(/\.png$/i, ""),
      extension: "png",
    });
    return;
  }
  const name = filename.endsWith(".png") ? filename : `${filename}.png`;
  const file = new File([blob], name, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1500);
}
