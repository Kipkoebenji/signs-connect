import type { RefObject } from "react";
import type { CameraState } from "@/types/translator";
import { CameraStatus } from "./CameraStatus";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  camera: CameraState;
  onStart: () => void;
  onStop: () => void;
}

export function CameraPreview({
  videoRef,
  canvasRef,
  camera,
  onStart,
  onStop,
}: CameraPreviewProps) {
  const active = camera.status === "requesting" || camera.status === "ready";

  return (
    <section className="visualization-section" aria-labelledby="camera-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sign to Text</p>
          <h2 id="camera-heading">Show your signs</h2>
        </div>
        <CameraStatus camera={camera} />
      </div>
      <div className="camera-frame">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Camera preview"
        />
        <canvas ref={canvasRef} aria-hidden="true" />
        {!active && (
          <div className="camera-overlay">Start the camera to begin</div>
        )}
      </div>
      <div className="camera-actions">
        {!active ? (
          <button className="primary-button" type="button" onClick={onStart}>
            Start camera
          </button>
        ) : (
          <button className="secondary-button" type="button" onClick={onStop}>
            Stop camera
          </button>
        )}
      </div>
    </section>
  );
}
