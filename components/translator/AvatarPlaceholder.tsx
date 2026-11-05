export function AvatarPlaceholder() {
  return (
    <section className="visualization-section" aria-labelledby="avatar-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Text to Sign</p>
          <h2 id="avatar-heading">Your signing avatar</h2>
        </div>
        <span className="coming-soon">Coming soon</span>
      </div>
      <div
        className="avatar-frame"
        aria-label="Sign language avatar placeholder"
      >
        <div className="avatar-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Your sign language avatar will appear here.</p>
      </div>
    </section>
  );
}
