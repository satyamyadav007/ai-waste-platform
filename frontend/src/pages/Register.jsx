import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

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
    <div className="auth-page">
      <div className="auth-container">

        <h1>Create Account</h1>

        <p>
          Create your CleanBharat account.
        </p>

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>


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
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
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


          <button type="submit">
            Create Account
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;