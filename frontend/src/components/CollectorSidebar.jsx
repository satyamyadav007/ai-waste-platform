import { NavLink, useNavigate } from "react-router-dom";

function CollectorSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem(
      "loggedInUser"
    );

    alert(
      "You have been logged out."
    );

    navigate("/");
  }

  return (
    <aside className="collector-sidebar">

      {/* BRAND */}

      <div className="collector-sidebar-brand">

        <div className="collector-brand-icon">
          ♻
        </div>

        <div>
          <strong>
            CleanBharat
          </strong>

          <span>
            Collector Portal
          </span>
        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="collector-sidebar-nav">

        <NavLink
          to="/collector-dashboard"
          className={({ isActive }) =>
            `collector-nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span>
            🏠
          </span>

          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/collector-pending"
          className={({ isActive }) =>
            `collector-nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span>
            🚛
          </span>

          <span>
            Pending
          </span>
        </NavLink>


        <NavLink
          to="/collector-collected"
          className={({ isActive }) =>
            `collector-nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span>
            ✅
          </span>

          <span>
            Collected
          </span>
        </NavLink>


        <NavLink
          to="/hotspots"
          className={({ isActive }) =>
            `collector-nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span>
            🔥
          </span>

          <span>
            Hotspots
          </span>
        </NavLink>

      </nav>


      {/* LOGOUT */}

      <div className="collector-sidebar-bottom">

        <button
          type="button"
          className="collector-logout"
          onClick={handleLogout}
        >
          <span>
            🚪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default CollectorSidebar;