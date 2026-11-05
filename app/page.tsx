"use client";

import type { Holistic, Results } from "@mediapipe/holistic";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./globals.css";

declare global {
  interface Window {
    Holistic: typeof Holistic;
  }
}

type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

const landmarkGroups: Array<{
  key: keyof Results;
  color: string;
}> = [
  { key: "poseLandmarks", color: "#22d3ee" },
  { key: "faceLandmarks", color: "#f472b6" },
  { key: "leftHandLandmarks", color: "#a3e635" },
  { key: "rightHandLandmarks", color: "#facc15" },
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
        3,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }
}

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Starting camera...");

  useEffect(() => {
    let active = true;
    let animationFrame = 0;
    let processing = false;
    let holistic: Holistic | null = null;

    const setup = async () => {
      try {
        if (!window.Holistic) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Holistic script failed to load"));
            document.head.appendChild(script);
          });
        }
        if (!active) return;

        holistic = new window.Holistic({
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
          if (!active) return;
          const video = webcamRef.current?.video;
          const canvas = canvasRef.current;
          if (!video || !canvas || video.videoWidth === 0) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          drawLandmarks(canvas, results, video.videoWidth, video.videoHeight);
          setStatus("Tracking landmarks");
        });

        const processFrame = async () => {
          if (!active || !holistic) return;
          const video = webcamRef.current?.video;
          if (
            video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
            !processing
          ) {
            processing = true;
            try {
              await holistic.send({ image: video });
            } catch {
              if (active) setStatus("Unable to process camera frames");
            } finally {
              processing = false;
            }
          }
          animationFrame = requestAnimationFrame(processFrame);
        };

        animationFrame = requestAnimationFrame(processFrame);
      } catch {
        if (active) setStatus("Unable to load MediaPipe Holistic");
      }
    };
    void setup();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      holistic?.close();
    };
  }, []);

  return (
    <main className="App">
      <header className="App-header">
        <p className="tracking-status">{status}</p>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          style={{
            width: "min(92vw, 960px)",
            height: "auto",
          }}
          onUserMediaError={() => setStatus("Camera access is required")}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            width: "min(92vw, 960px)",
            height: "auto",
          }}
        />
      </header>
    </main>
  );
}

export default App;
