import type { CameraState } from "@/types/translator";

const statusCopy: Record<CameraState["status"], string> = {
  idle: "Camera is off",
  requesting: "Requesting camera access",
  ready: "Camera ready",
  error: "Camera unavailable",
  stopped: "Camera stopped",
};

const errorCopy: Record<NonNullable<CameraState["error"]>, string> = {
  "permission-denied": "Allow camera access in your browser to continue.",
  "no-camera": "No camera was found on this device.",
  "camera-in-use": "The camera may already be in use by another application.",
  unsupported: "This browser does not support camera access.",
  "initialization-failed":
    "The camera could not be initialized. Please try again.",
};

export function CameraStatus({ camera }: { camera: CameraState }) {
  return (
    <div
      className={`camera-status ${camera.status}`}
      role="status"
      aria-live="polite"
    >
      <span className="status-dot" aria-hidden="true" />
      <span>
        {camera.error ? errorCopy[camera.error] : statusCopy[camera.status]}
      </span>
    </div>
  );
}
