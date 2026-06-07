"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadElementAsPng } from "@/lib/share-cards";
import { cn } from "@/lib/utils";

interface ShareCardCaptureProps {
  children: React.ReactNode;
  filename: string;
  previewScale?: number;
  previewClassName?: string;
  className?: string;
}

export function ShareCardCapture({
  children,
  filename,
  previewScale = 0.35,
  previewClassName,
  className,
}: ShareCardCaptureProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) {
      return;
    }

    setDownloading(true);
    try {
      await downloadElementAsPng(captureRef.current, filename);
    } finally {
      setDownloading(false);
    }
  }, [downloading, filename]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900",
          previewClassName,
        )}
      >
        <div
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            width: "fit-content",
          }}
        >
          {children}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full"
      >
        {downloading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        Download PNG
      </Button>

      <div
        ref={captureRef}
        aria-hidden
        className="pointer-events-none fixed"
        style={{ left: -9999, top: 0 }}
      >
        {children}
      </div>
    </div>
  );
}
