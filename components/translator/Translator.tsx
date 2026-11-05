"use client";

import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import type { TranslationMode } from "@/types/translator";
import { AvatarPlaceholder } from "./AvatarPlaceholder";
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
      {/* <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          SC
        </div>
        <p className="brand-name">Signs Connect</p>
        <h1>Kenyan Sign Language Translation</h1>
        <p className="intro">
          A clear bridge between signing and everyday communication.
        </p>
      </header> */}

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
          <AvatarPlaceholder />
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
