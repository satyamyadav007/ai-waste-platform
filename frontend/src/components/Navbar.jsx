import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    setIsLoggedIn(!!loggedInUser);
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("loggedInUser");

    setIsLoggedIn(false);

    alert("You have been logged out.");

    navigate("/");
  }

  return (
    <nav className="navbar">

      <h2>CleanBharat</h2>

      <div className="navbar-links">

        <Link to="/">Home</Link>

        <Link to="/report">
          Report Garbage
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;