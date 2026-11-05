interface TranslationOutputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function TranslationOutput({
  value,
  onChange,
  onClear,
}: TranslationOutputProps) {
  const copy = async () => {
    if (value) await navigator.clipboard?.writeText(value);
  };

  return (
    <section className="text-section" aria-labelledby="output-heading">
      <div className="field-heading">
        <label id="output-heading" htmlFor="translated-text">
          Translated text
        </label>
        <span>Read only</span>
      </div>
      <textarea
        id="translated-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Your recognized signs will appear here..."
        readOnly
        rows={4}
      />
      <div className="field-actions">
        <button
          className="text-button"
          type="button"
          onClick={copy}
          disabled={!value}
        >
          Copy
        </button>
        <button
          className="text-button"
          type="button"
          onClick={onClear}
          disabled={!value}
        >
          Clear
        </button>
      </div>
    </section>
  );
}
