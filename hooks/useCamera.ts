"use client";

import type { Holistic, Results } from "@mediapipe/holistic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraError, CameraState } from "@/types/translator";

declare global {
  interface Window {
    Holistic: typeof Holistic;
  }
}

type Landmark = {
  x: number;
  y: number;
  visibility?: number;
};

const landmarkGroups: Array<{ key: keyof Results; color: string }> = [
  { key: "poseLandmarks", color: "#1d9bf0" },
  { key: "faceLandmarks", color: "#e76f9a" },
  { key: "leftHandLandmarks", color: "#7cb342" },
  { key: "rightHandLandmarks", color: "#e0a11a" },
];

function drawLandmarks(
  canvas: HTMLCanvasElement,
  results: Results,
  width: number,
  height: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, width, height);
  for (const group of landmarkGroups) {
    const landmarks = results[group.key] as Landmark[] | undefined;
    if (!landmarks) continue;

    context.fillStyle = group.color;
    for (const landmark of landmarks) {
      if (landmark.visibility !== undefined && landmark.visibility < 0.5) {
        continue;
      }

      context.beginPath();
      context.arc(
        (1 - landmark.x) * width,
        landmark.y * height,
        2.5,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }
}

function getCameraError(error: unknown): CameraError {
  if (!(error instanceof DOMException)) return "initialization-failed";
  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "permission-denied";
  }
  if (error.name === "NotFoundError") return "no-camera";
  if (error.name === "NotReadableError" || error.name === "AbortError") {
    return "camera-in-use";
  }
  return "initialization-failed";
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const frameRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const activeRef = useRef(false);
  const [camera, setCamera] = useState<CameraState>({ status: "idle" });

  const stop = useCallback(() => {
    activeRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    holisticRef.current?.close();
    holisticRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamera((current) =>
      current.status === "idle" ? current : { status: "stopped" },
    );
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera({ status: "error", error: "unsupported" });
      return;
    }

    stop();
    setCamera({ status: "requesting" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      });
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Video element is unavailable");
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      activeRef.current = true;

      if (!window.Holistic) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Holistic script failed to load"));
          document.head.appendChild(script);
        });
      }

      if (!activeRef.current) return;
      const holistic = new window.Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });
      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      holistic.onResults((results) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!activeRef.current || !video || !canvas || video.videoWidth === 0) {
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        drawLandmarks(canvas, results, video.videoWidth, video.videoHeight);
      });
      holisticRef.current = holistic;
      setCamera({ status: "ready" });

      const processFrame = async () => {
        const video = videoRef.current;
        const currentHolistic = holisticRef.current;
        if (!activeRef.current || !video || !currentHolistic) return;

        if (
          video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
          !processingRef.current
        ) {
          processingRef.current = true;
          try {
            await currentHolistic.send({ image: video });
          } catch {
            if (activeRef.current) {
              setCamera({ status: "error", error: "initialization-failed" });
            }
          } finally {
            processingRef.current = false;
          }
        }
        frameRef.current = requestAnimationFrame(processFrame);
      };

      frameRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      stop();
      setCamera({ status: "error", error: getCameraError(error) });
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, canvasRef, camera, start, stop };
}
