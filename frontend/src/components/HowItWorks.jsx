function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="section-heading">
        <p className="section-tag">HOW IT WORKS</p>

        <h2>
          From garbage report
          <br />
          to preventive action.
        </h2>

        <p>
          CleanBharat connects citizens, waste collectors and AI
          to make waste management faster, transparent and smarter.
        </p>
      </div>

      <div className="steps">

        <div className="step">
          <span>01</span>
          <h3>Report</h3>
          <p>
            Upload a photo of garbage and share its location.
          </p>
        </div>

        <div className="step">
          <span>02</span>
          <h3>AI Analysis</h3>
          <p>
            AI detects garbage, estimates severity and checks
            for duplicate reports.
          </p>
        </div>

        <div className="step">
          <span>03</span>
          <h3>Collection</h3>
          <p>
            The issue is assigned to the appropriate waste collector.
          </p>
        </div>

        <div className="step">
          <span>04</span>
          <h3>Verification</h3>
          <p>
            Collection is verified using before-and-after images.
          </p>
        </div>

        <div className="step">
          <span>05</span>
          <h3>Rating</h3>
          <p>
            Citizens can rate the collection service after completion.
          </p>
        </div>

        <div className="step">
          <span>06</span>
          <h3>Prediction</h3>
          <p>
            Historical reports help identify recurring and future
            garbage hotspots.
          </p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;