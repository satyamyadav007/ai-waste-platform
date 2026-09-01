function Footer() {
  return (
    <footer className="footer">

      <div className="footer-content">

        <div className="footer-brand">
          <h2>CleanBharat</h2>
          <p>
            AI-powered waste reporting, collection,
            verification and prediction.
          </p>
        </div>

        <div className="footer-links">
          <h3>Platform</h3>
          <a href="/">Home</a>
          <a href="/report">Report Garbage</a>
          <a href="/login">Login</a>
        </div>

        <div className="footer-links">
          <h3>AI Features</h3>
          <a href="/">Severity Detection</a>
          <a href="/">Duplicate Detection</a>
          <a href="/">Hotspot Prediction</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 CleanBharat. Built for a cleaner India.</p>
      </div>

    </footer>
  );
}

export default Footer;