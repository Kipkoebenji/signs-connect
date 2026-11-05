export type TranslationMode = "SIGN_TO_TEXT" | "TEXT_TO_SIGN";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "error"
  | "stopped";

export type CameraError =
  | "permission-denied"
  | "no-camera"
  | "camera-in-use"
  | "unsupported"
  | "initialization-failed";

export interface CameraState {
  status: CameraStatus;
  error?: CameraError;
}
