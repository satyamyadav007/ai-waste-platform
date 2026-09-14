import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();

    const users =
      JSON.parse(
        localStorage.getItem("cleanBharatUsers")
      ) || [];

    if (users.length === 0) {
      alert(
        "No account found. Please register first."
      );
      return;
    }

    const savedUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
          email.toLowerCase() &&
        user.password === password
    );

    if (!savedUser) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(savedUser)
    );

    alert("Login successful!");

    if (savedUser.role === "collector") {
      navigate("/collector-dashboard");
    } else if (savedUser.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="login-brand">
          <div className="brand-icon">♻</div>
          <span>CleanBharat</span>
        </div>

        <div className="login-hero-content">

          <p className="login-tag">
            AI-POWERED WASTE MANAGEMENT
          </p>

          <h1>
            Welcome back to
            <span> CleanBharat</span>
          </h1>

          <p>
            Help create cleaner communities with
            AI-powered reporting, collection tracking,
            verification, and waste hotspot intelligence.
          </p>

          <div className="login-highlights">

            <div className="login-highlight">
              <span>🤖</span>
              <div>
                <strong>AI-Powered</strong>
                <small>Smart waste detection</small>
              </div>
            </div>

            <div className="login-highlight">
              <span>📍</span>
              <div>
                <strong>Location Based</strong>
                <small>Track waste reports</small>
              </div>
            </div>

            <div className="login-highlight">
              <span>🌱</span>
              <div>
                <strong>Cleaner Future</strong>
                <small>Build cleaner communities</small>
              </div>
            </div>

          </div>

        </div>

      </div>


      <div className="login-right">

        <div className="login-card">

          <div className="mobile-brand">
            <div className="brand-icon">♻</div>
            <span>CleanBharat</span>
          </div>

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Login to continue to your account
          </p>

          <form
            className="auth-form login-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>


            <button
              className="login-button"
              type="submit"
            >
              Login
            </button>

          </form>

          <div className="login-divider">
            <span>CleanBharat</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <button
              type="button"
              className="register-link"
              onClick={() => navigate("/register")}
            >
              Register here
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;