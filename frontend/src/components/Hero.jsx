import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <p className="hero-tag">
          AI-POWERED WASTE MANAGEMENT
        </p>

        <h1>
          See Waste.
          <br />
          Report It.
          <br />
          Prevent It.
        </h1>

        <p className="hero-description">
          Help build cleaner communities with AI-powered waste reporting,
          collection tracking, verification, and prediction.
        </p>

        <div className="hero-buttons">

          <Link to="/report">
            Report Garbage
          </Link>

          <a href="#how-it-works">
            Learn How It Works
          </a>

        </div>

      </div>

    </section>
  );
}

export default Hero;