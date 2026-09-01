function AIFeatures() {
  return (
    <section className="ai-features">

      <div className="section-heading">
        <p className="section-tag">AI ADVANTAGE</p>

        <h2>
          Don't just respond
          <br />
          to waste. Predict it.
        </h2>

        <p>
          CleanBharat uses AI to turn individual garbage reports
          into actionable intelligence for communities and waste
          management teams.
        </p>
      </div>

      <div className="ai-grid">

        <div className="ai-card">
          <span>01</span>
          <h3>Garbage Severity Detection</h3>
          <p>
            AI analyzes uploaded images and estimates how serious
            the garbage situation is.
          </p>
        </div>

        <div className="ai-card">
          <span>02</span>
          <h3>Complaint Prioritization</h3>
          <p>
            Reports can be ranked based on severity, location and
            other factors to help collectors act faster.
          </p>
        </div>

        <div className="ai-card">
          <span>03</span>
          <h3>Duplicate Detection</h3>
          <p>
            AI can identify reports referring to the same garbage
            location and reduce duplicate complaints.
          </p>
        </div>

        <div className="ai-card">
          <span>04</span>
          <h3>Collection Verification</h3>
          <p>
            Before-and-after images can help verify whether the
            reported garbage was actually removed.
          </p>
        </div>

        <div className="ai-card">
          <span>05</span>
          <h3>Recurring Hotspots</h3>
          <p>
            Historical reports help identify locations where
            garbage repeatedly appears.
          </p>
        </div>

        <div className="ai-card">
          <span>06</span>
          <h3>Predictive Hotspots</h3>
          <p>
            Historical patterns can be used to predict where
            garbage problems may occur next.
          </p>
        </div>

      </div>

    </section>
  );
}

export default AIFeatures;