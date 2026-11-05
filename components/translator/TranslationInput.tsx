interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onTranslate: () => void;
}

export function TranslationInput({
  value,
  onChange,
  onClear,
  onTranslate,
}: TranslationInputProps) {
  return (
    <section className="text-section" aria-labelledby="input-heading">
      <div className="field-heading">
        <label id="input-heading" htmlFor="translation-input">
          Text to translate
        </label>
        <span>KSL</span>
      </div>
      <textarea
        id="translation-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter text to translate into Kenyan Sign Language..."
        rows={4}
      />
      <div className="field-actions">
        <button
          className="text-button"
          type="button"
          onClick={onClear}
          disabled={!value}
        >
          Clear
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onTranslate}
          disabled={!value.trim()}
        >
          Translate
        </button>
      </div>
    </section>
  );
}
