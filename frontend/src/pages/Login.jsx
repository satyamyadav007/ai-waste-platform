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
    <div className="auth-page">
      <div className="auth-container">

        <h1>Welcome Back</h1>

        <p>
          Login to your CleanBharat account.
        </p>

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
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
            />
          </div>


          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;