import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import AIFeatures from "../components/AIFeatures";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <Hero />

      <section className="smart-system-section">
        <div className="smart-system-heading">
          <p className="section-tag">
            SMART WASTE MANAGEMENT
          </p>

          <h2>
            From Garbage Reports to Smart Action
          </h2>

          <p>
            CleanBharat combines citizen reports,
            AI analysis and collector verification
            to make waste management smarter and
            more transparent.
          </p>
        </div>

        <div className="smart-system-grid">

          <div className="smart-system-card">
            <div className="smart-system-icon">
              🤖
            </div>

            <h3>
              AI Garbage Detection
            </h3>

            <p>
              AI analyzes uploaded images to identify
              garbage, classify waste type and estimate
              severity.
            </p>
          </div>


          <div className="smart-system-card">
            <div className="smart-system-icon">
              🚨
            </div>

            <h3>
              Smart Prioritization
            </h3>

            <p>
              Reports are ranked according to AI
              severity so high-priority garbage
              problems can be handled first.
            </p>
          </div>


          <div className="smart-system-card">
            <div className="smart-system-icon">
              🔍
            </div>

            <h3>
              AI Collection Verification
            </h3>

            <p>
              Before and after images are compared
              to help verify whether the reported
              garbage was actually removed.
            </p>
          </div>


          <div className="smart-system-card">
            <div className="smart-system-icon">
              🔥
            </div>

            <h3>
              Garbage Hotspots
            </h3>

            <p>
              Repeated complaints near the same area
              are used to identify recurring garbage
              hotspots.
            </p>
          </div>

        </div>
      </section>

      <HowItWorks />

      <AIFeatures />

      <section className="platform-features">
        <div className="platform-features-heading">
          <p className="section-tag">
            PLATFORM FEATURES
          </p>

          <h2>
            Explore CleanBharat
          </h2>

          <p>
            Access the different parts of the
            CleanBharat waste management platform.
          </p>
        </div>

        <div className="platform-feature-grid">

          <div className="platform-feature-card">
            <div className="platform-feature-icon">
              🔥
            </div>

            <h3>
              Garbage Hotspots
            </h3>

            <p>
              Identify areas where garbage complaints
              are repeatedly reported.
            </p>

            <Link
              to="/hotspots"
              className="platform-feature-button"
            >
              View Hotspots
            </Link>
          </div>


          <div className="platform-feature-card">
            <div className="platform-feature-icon">
              🛡️
            </div>

            <h3>
              Admin Monitoring
            </h3>

            <p>
              Monitor reports, priorities, hotspots,
              collections and citizen ratings.
            </p>

            <Link
              to="/admin-dashboard"
              className="platform-feature-button"
            >
              View Admin Dashboard
            </Link>
          </div>


          <div className="platform-feature-card">
            <div className="platform-feature-icon">
              🚛
            </div>

            <h3>
              Collector Portal
            </h3>

            <p>
              Collectors can manage reports, upload
              proof and complete verified collections.
            </p>

            <Link
              to="/collector-dashboard"
              className="platform-feature-button"
            >
              Open Collector Portal
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Home;