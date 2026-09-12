import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");

    if (savedUser) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (error) {
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("loggedInUser");

    setLoggedInUser(null);

    alert("You have been logged out.");

    navigate("/");
  }

  function getDashboardLink() {
    if (!loggedInUser) {
      return "/login";
    }

    if (loggedInUser.role === "collector") {
      return "/collector-dashboard";
    }

    if (loggedInUser.role === "admin") {
      return "/admin-dashboard";
    }

    return "/dashboard";
  }

  function getDashboardName() {
    if (!loggedInUser) {
      return "Dashboard";
    }

    if (loggedInUser.role === "collector") {
      return "Collector Dashboard";
    }

    if (loggedInUser.role === "admin") {
      return "Admin Dashboard";
    }

    return "Dashboard";
  }

  return (
    <nav className="navbar">

      <h2>CleanBharat</h2>

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        {(!loggedInUser ||
          loggedInUser.role === "citizen") && (
          <Link to="/report">
            Report Garbage
          </Link>
        )}

        {loggedInUser ? (
          <>
            <Link to={getDashboardLink()}>
              {getDashboardName()}
            </Link>

            <Link to="/hotspots">
              Hotspots
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
            <Link to="/hotspots">
              Hotspots
            </Link>

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