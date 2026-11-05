import type { TranslationMode } from "@/types/translator";

interface TranslationModeToggleProps {
  mode: TranslationMode;
  onChange: (mode: TranslationMode) => void;
}

export function TranslationModeToggle({
  mode,
  onChange,
}: TranslationModeToggleProps) {
  return (
    <div className="mode-toggle" aria-label="Translation mode" role="group">
      <button
        className={
          mode === "SIGN_TO_TEXT" ? "mode-button active" : "mode-button"
        }
        type="button"
        aria-pressed={mode === "SIGN_TO_TEXT"}
        onClick={() => onChange("SIGN_TO_TEXT")}
      >
        Sign to Text
      </button>
      <button
        className={
          mode === "TEXT_TO_SIGN" ? "mode-button active" : "mode-button"
        }
        type="button"
        aria-pressed={mode === "TEXT_TO_SIGN"}
        onClick={() => onChange("TEXT_TO_SIGN")}
      >
        Text to Sign
      </button>
    </div>
  );
}
