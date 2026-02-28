import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useCallback, useRef } from "react";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  employeeName: string;
}

export default function QRCodeModal({ open, onOpenChange, url, employeeName }: QRCodeModalProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `QR_${employeeName.replace(/\s+/g, "_")}.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  }, [employeeName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs mx-auto text-center">
        <DialogTitle className="text-lg font-semibold text-foreground">
          Mã QR - {employeeName}
        </DialogTitle>
        <div ref={svgRef} className="flex justify-center py-4">
          <QRCodeSVG
            value={url}
            size={220}
            level="H"
            bgColor="#ffffff"
            fgColor="hsl(212, 56%, 23%)"
            includeMargin
          />
        </div>
        <p className="text-xs text-muted-foreground mb-2">Quét mã để xem danh thiếp</p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity min-h-[48px]"
        >
          <Download className="w-4 h-4" />
          Tải QR Code
        </button>
      </DialogContent>
    </Dialog>
  );
}
