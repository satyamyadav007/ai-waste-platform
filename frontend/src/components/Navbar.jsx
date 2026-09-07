import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <h2>CleanBharat</h2>

      <div className="navbar-links">

        <Link to="/">Home</Link>

        <Link to="/report">
          Report Garbage
        </Link>

        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/login">
          Login
        </Link>

        <Link to="/register">
          Register
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;