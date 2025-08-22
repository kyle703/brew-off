import QRCodeStyling from "qr-code-styling";
import { motion } from "framer-motion";

type Props = {
  url: string;
  label: string;
  className?: string;
};

/**
 * A Bavarian-themed QR code component with decorative banner and gold label
 * Used for Registration and Judging links
 */
export default function BavarianQRCode({ url, label, className = "" }: Props) {
  // Create QR code with Bavarian styling
  const qrCode = new QRCodeStyling({
    width: 280,
    height: 280,
    data: url,
    dotsOptions: {
      color: "#1e2d4a", // navy-800 for the gradient effect
      type: "rounded",
    },
    backgroundOptions: {
      color: "#F3E9D2", // parchment
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#E3B341", // gold-600
    },
    cornersDotOptions: {
      type: "dot",
      color: "#E3B341", // gold-600
    },
  });

  return (
    <motion.div
      className={`flex flex-col items-center gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Decorative Bavarian Banner - Now a clickable button */}
      <div className="relative w-full max-w-sm">
        <button
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          className="relative w-full px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 rounded-lg transform hover:-translate-y-1 border-2 border-gold-600"
        >
          {/* Content panel */}
          <div className="relative px-4 py-2 bg-amber-50 border-2 border-navy-800 rounded-sm">
            <div className="text-center">
              <h3 className="font-bold text-xl font-fraktur text-stone-900 leading-tight">
                {label}
              </h3>
            </div>
          </div>
        </button>
      </div>

      {/* QR Code - Outer div with cream background and borders */}
      <div className="w-[300px] h-[300px] bg-parchment rounded-lg border-2 border-gold-600 shadow-lg relative">
        {/* Navy border inside gold border */}
        <div className="absolute inset-2 rounded-lg border-2 border-navy-800" />
        
        {/* QR Code container - centered within the outer div */}
        <div className="absolute inset-4 rounded-lg overflow-hidden flex items-center justify-center">
          <div
            ref={(el) => {
              if (el) {
                el.innerHTML = "";
                qrCode.append(el);
              }
            }}
            className="w-[280px] h-[280px]"
          />
        </div>
      </div>
    </motion.div>
  );
} 