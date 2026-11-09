"use client";

import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import type { TranslationMode } from "@/types/translator";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { CameraPreview } from "./CameraPreview";
import { TranslationInput } from "./TranslationInput";
import { TranslationModeToggle } from "./TranslationModeToggle";
import { TranslationOutput } from "./TranslationOutput";

export function Translator() {
  const [mode, setMode] = useState<TranslationMode>("SIGN_TO_TEXT");
  const [translatedText, setTranslatedText] = useState("");
  const [inputText, setInputText] = useState("");
  const camera = useCamera();

  const changeMode = (nextMode: TranslationMode) => {
    if (nextMode === "TEXT_TO_SIGN") camera.stop();
    setMode(nextMode);
  };

  return (
    <main className="translator-shell">
      <TranslationModeToggle mode={mode} onChange={changeMode} />

      {mode === "SIGN_TO_TEXT" ? (
        <>
          <CameraPreview
            videoRef={camera.videoRef}
            canvasRef={camera.canvasRef}
            camera={camera.camera}
            onStart={camera.start}
            onStop={camera.stop}
          />
          <TranslationOutput
            value={translatedText}
            onChange={setTranslatedText}
            onClear={() => setTranslatedText("")}
          />
        </>
      ) : (
        <>
          <div className="h-75 w-full">
            <Canvas camera={{ position: [0, 1.5, 3] }}>
              <ambientLight intensity={1} />
              <directionalLight position={[2, 3, 2]} />

              <AnimatedAvatar />
            </Canvas>
          </div>
          <TranslationInput
            value={inputText}
            onChange={setInputText}
            onClear={() => setInputText("")}
            onTranslate={() => undefined}
          />
        </>
      )}
    </main>
  );
}
