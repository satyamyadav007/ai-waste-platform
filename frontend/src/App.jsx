import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function ProtectedDashboard() {
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return <CitizenDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/report" element={<ReportGarbage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />

        <Route
        path="/collector-dashboard"
        element={<CollectorDashboard />}
        />

        <Route
        path="/hotspots"
        element={<Hotspots />}
        />

        <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;