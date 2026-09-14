import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

  const navigate = useNavigate();

  function handleRegister(event) {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    const existingUsers =
      JSON.parse(
        localStorage.getItem("cleanBharatUsers")
      ) || [];

    const userAlreadyExists =
      existingUsers.some(
        (user) =>
          user.email.toLowerCase() ===
          email.toLowerCase()
      );

    if (userAlreadyExists) {
      alert(
        "An account with this email already exists."
      );
      return;
    }

    const user = {
      name: name,
      email: email,
      password: password,
      role: role,
    };

    existingUsers.push(user);

    localStorage.setItem(
      "cleanBharatUsers",
      JSON.stringify(existingUsers)
    );

    alert("Registration successful!");

    setName("");
    setEmail("");
    setPassword("");
    setRole("citizen");
  }

  return (
    <div className="register-page">

      <div className="register-left">

        <div className="register-brand">
          <div className="brand-icon">♻</div>
          <span>CleanBharat</span>
        </div>

        <div className="register-hero-content">

          <p className="register-tag">
            JOIN THE CLEANER FUTURE
          </p>

          <h1>
            Be part of
            <span> CleanBharat</span>
          </h1>

          <p>
            Create your account and help make your
            community cleaner through AI-powered waste
            reporting and collection management.
          </p>

          <div className="register-highlights">

            <div className="register-highlight">
              <span>📸</span>
              <div>
                <strong>Report Waste</strong>
                <small>Share garbage around you</small>
              </div>
            </div>

            <div className="register-highlight">
              <span>🤖</span>
              <div>
                <strong>AI Intelligence</strong>
                <small>Smart waste analysis</small>
              </div>
            </div>

            <div className="register-highlight">
              <span>🌱</span>
              <div>
                <strong>Make an Impact</strong>
                <small>Build cleaner communities</small>
              </div>
            </div>

          </div>

        </div>

      </div>


      <div className="register-right">

        <div className="register-card">

          <div className="mobile-register-brand">
            <div className="brand-icon">♻</div>
            <span>CleanBharat</span>
          </div>

          <h2>Create Account</h2>

          <p className="register-subtitle">
            Join CleanBharat and start making a difference
          </p>

          <form
            className="auth-form register-form"
            onSubmit={handleRegister}
          >

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>


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
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="role">
                Account Type
              </label>

              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              >
                <option value="citizen">
                  Citizen
                </option>

                <option value="collector">
                  Collector
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

            </div>


            <button
              className="register-button"
              type="submit"
            >
              Create Account
            </button>

          </form>


          <div className="register-divider">
            <span>CleanBharat</span>
          </div>


          <p className="login-text">
            Already have an account?

            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/login")}
            >
              Login here
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;