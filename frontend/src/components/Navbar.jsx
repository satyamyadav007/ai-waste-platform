import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // --------------------------------------------------
  // CHECK LOGIN STATUS
  // --------------------------------------------------

  useEffect(() => {
    const savedUser =
      localStorage.getItem("loggedInUser");

    if (savedUser) {
      try {
        setLoggedInUser(
          JSON.parse(savedUser)
        );
      } catch (error) {
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
  }, [location.pathname]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  function handleLogout() {
    localStorage.removeItem("loggedInUser");

    setLoggedInUser(null);

    alert(
      "You have been logged out."
    );

    navigate("/");
  }

  // --------------------------------------------------
  // DASHBOARD LINK
  // --------------------------------------------------

  function getDashboardLink() {
    if (!loggedInUser) {
      return "/login";
    }

    if (
      loggedInUser.role ===
      "collector"
    ) {
      return "/collector-dashboard";
    }

    if (
      loggedInUser.role ===
      "admin"
    ) {
      return "/admin-dashboard";
    }

    return "/dashboard";
  }

  // --------------------------------------------------
  // DASHBOARD NAME
  // --------------------------------------------------

  function getDashboardName() {
    if (!loggedInUser) {
      return "Dashboard";
    }

    if (
      loggedInUser.role ===
      "collector"
    ) {
      return "Collector Dashboard";
    }

    if (
      loggedInUser.role ===
      "admin"
    ) {
      return "Admin Dashboard";
    }

    return "Dashboard";
  }

  return (
    <nav className="navbar">

      {/* LOGO */}

      <h2>
        CleanBharat
      </h2>

      <div className="navbar-links">

        {/* HOME */}

        <Link to="/">
          Home
        </Link>

        {/* --------------------------------------------------
            LOGGED IN USERS
        -------------------------------------------------- */}

        {loggedInUser ? (

          <>

            {/* CITIZEN ONLY */}

            {loggedInUser.role ===
              "citizen" && (

              <Link to="/report">
                Report Garbage
              </Link>

            )}

            {/* DASHBOARD */}

            <Link
              to={getDashboardLink()}
            >
              {getDashboardName()}
            </Link>

            {/* HOTSPOTS */}

            <Link to="/hotspots">
              Hotspots
            </Link>

            {/* LOGOUT */}

            <button
              onClick={
                handleLogout
              }
              className="logout-button"
              type="button"
            >
              Logout
            </button>

          </>

        ) : (

          /* --------------------------------------------------
             LOGGED OUT USERS
          -------------------------------------------------- */

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