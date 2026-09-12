import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportGarbage from "./pages/ReportGarbage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import Hotspots from "./pages/Hotspots";
import AdminDashboard from "./pages/AdminDashboard";


// --------------------------------------------------
// GET LOGGED-IN USER
// --------------------------------------------------

function getLoggedInUser() {
  const loggedInUser =
    localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    return null;
  }

  try {
    return JSON.parse(loggedInUser);
  } catch (error) {
    return null;
  }
}


// --------------------------------------------------
// CITIZEN PROTECTED ROUTE
// --------------------------------------------------

function ProtectedCitizenDashboard() {
  const user = getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "citizen") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <CitizenDashboard />;
}


// --------------------------------------------------
// COLLECTOR PROTECTED ROUTE
// --------------------------------------------------

function ProtectedCollectorDashboard() {
  const user = getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "collector") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <CollectorDashboard />;
}


// --------------------------------------------------
// ADMIN PROTECTED ROUTE
// --------------------------------------------------

function ProtectedAdminDashboard() {
  const user = getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <AdminDashboard />;
}


// --------------------------------------------------
// MAIN APP
// --------------------------------------------------

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* REPORT GARBAGE */}
        <Route
          path="/report"
          element={<ReportGarbage />}
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />


        {/* CITIZEN DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedCitizenDashboard />
          }
        />


        {/* COLLECTOR DASHBOARD */}
        <Route
          path="/collector-dashboard"
          element={
            <ProtectedCollectorDashboard />
          }
        />


        {/* HOTSPOTS */}
        <Route
          path="/hotspots"
          element={<Hotspots />}
        />


        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedAdminDashboard />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;