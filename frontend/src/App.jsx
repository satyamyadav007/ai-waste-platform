import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import CollectorLayout from "./components/CollectorLayout";

import Home from "./pages/Home";
import ReportGarbage from "./pages/ReportGarbage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import CollectorPending from "./pages/CollectorPending";
import CollectorCollected from "./pages/CollectorCollected";
import Hotspots from "./pages/Hotspots";
import AdminDashboard from "./pages/AdminDashboard";

// --------------------------------------------------
// GET LOGGED-IN USER
// --------------------------------------------------

function getLoggedInUser() {
  const loggedInUser =
    localStorage.getItem(
      "loggedInUser"
    );

  if (!loggedInUser) {
    return null;
  }

  try {
    return JSON.parse(
      loggedInUser
    );
  } catch (error) {
    return null;
  }
}

// --------------------------------------------------
// PROTECTED CITIZEN DASHBOARD
// --------------------------------------------------

function ProtectedCitizenDashboard() {
  const user =
    getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !==
    "citizen"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <CitizenDashboard />
  );
}

// --------------------------------------------------
// PROTECTED REPORT
// --------------------------------------------------

function ProtectedReportGarbage() {
  const user =
    getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !==
    "citizen"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <ReportGarbage />
  );
}

// --------------------------------------------------
// PROTECTED HOTSPOTS
// --------------------------------------------------

function ProtectedHotspots() {
  const user =
    getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !== "citizen" &&
    user.role !== "collector" &&
    user.role !== "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <Hotspots />
  );
}

// --------------------------------------------------
// PROTECTED ADMIN DASHBOARD
// --------------------------------------------------

function ProtectedAdminDashboard() {
  const user =
    getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !==
    "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <AdminDashboard />
  );
}

// --------------------------------------------------
// PROTECTED COLLECTOR LAYOUT
// --------------------------------------------------

function ProtectedCollectorLayout() {
  const user =
    getLoggedInUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !==
    "collector"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <CollectorLayout />
  );
}

// --------------------------------------------------
// APP
// --------------------------------------------------

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* CITIZEN */}

        <Route
          path="/report"
          element={
            <ProtectedReportGarbage />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedCitizenDashboard />
          }
        />


        {/* COLLECTOR */}

        <Route
          element={
            <ProtectedCollectorLayout />
          }
        >

          <Route
            path="/collector-dashboard"
            element={
              <CollectorDashboard />
            }
          />

          <Route
            path="/collector-pending"
            element={
              <CollectorPending />
            }
          />

          <Route
            path="/collector-collected"
            element={
              <CollectorCollected />
            }
          />

        </Route>


        {/* SHARED HOTSPOTS */}

        <Route
          path="/hotspots"
          element={
            <ProtectedHotspots />
          }
        />


        {/* ADMIN */}

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