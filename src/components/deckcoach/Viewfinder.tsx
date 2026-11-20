import { CameraOff, Loader2, RefreshCw } from "lucide-react";
import { type RefObject } from "react";

import { Button } from "@/components/ui/button";
import type { CameraInfo, CameraStatus } from "@/hooks/use-camera";
import type { CameraErrorKind } from "@/lib/camera";
import { cn } from "@/lib/utils";

const ERROR_COPY: Record<CameraErrorKind, { title: string; body: string }> = {
  denied: {
    title: "Camera access blocked",
    body: "Allow camera access in your browser settings, then try again. If you're inside an embedded preview, open DeckCoach in its own tab.",
  },
  "not-found": {
    title: "No camera found",
    body: "Connect a webcam or switch to a device with a camera.",
  },
  "in-use": {
    title: "Camera is busy",
    body: "Another app may be using the camera. Close it and try again.",
  },
  unsupported: {
    title: "Camera not supported here",
    body: "This browser can't open the camera. Use Safari or Chrome over a secure (https) connection.",
  },
  unknown: {
    title: "Couldn't start the camera",
    body: "Something went wrong opening the camera. Try again.",
  },
};

interface ViewfinderProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: CameraErrorKind | null;
  info: CameraInfo | null;
  onRetry: () => void;
}

export function Viewfinder({ videoRef, status, error, info, onRetry }: ViewfinderProps) {
  const copy = error ? ERROR_COPY[error] : null;
  const live = status === "live";
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        disablePictureInPicture
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          live ? "opacity-100" : "opacity-0",
          info?.mirrored && "-scale-x-100",
        )}
      />

      {/* Measured edge scrims for HUD contrast without clouding the central 85% camera space */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Minimalist perimeter reticle corners keeping the entire center frame open */}
      <div className="pointer-events-none absolute inset-3 sm:inset-5">
        <span className="absolute top-0 left-0 size-4 border-t border-l border-paper/35" />
        <span className="absolute top-0 right-0 size-4 border-t border-r border-paper/35" />
        <span className="absolute bottom-0 left-0 size-4 border-b border-l border-paper/35" />
        <span className="absolute bottom-0 right-0 size-4 border-b border-r border-paper/35" />
      </div>

      {status === "starting" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="hud-glass flex items-center gap-3 rounded-lg px-4 py-2.5 text-paper">
            <Loader2 className="size-4 animate-spin text-primary" />
            <p className="font-mono text-xs tracking-wide">Starting camera…</p>
          </div>
        </div>
      )}

      {status === "error" && copy && (
        <div className="absolute inset-0 z-40 grid place-items-center p-6">
          <div className="hud-glass w-full max-w-sm animate-slap rounded-xl p-6 text-center text-paper">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-lg border border-hazard/40 bg-hazard/15 text-hazard">
              <CameraOff className="size-5" />
            </span>
            <h2 className="font-marker text-2xl leading-tight text-paper">{copy.title}</h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
              {copy.body}
            </p>
            <Button
              variant="default"
              className="mt-5 min-h-[44px] w-full rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground press hover:bg-primary/90"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
