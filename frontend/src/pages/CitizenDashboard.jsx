import { useState } from "react";

function CitizenDashboard() {
  const [reports] = useState(() => {
    const allReports =
      JSON.parse(localStorage.getItem("garbageReports")) || [];

    const loggedInUser =
      JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
      return [];
    }

    return allReports.filter(
      (report) => report.userEmail === loggedInUser.email
    );
  });

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

 const resolvedReports = reports.filter(
  (report) =>
    report.status === "Collected" ||
    report.status === "Resolved"
).length;

  function getGarbageTypeName(type) {
    const types = {
      household: "Household Waste",
      plastic: "Plastic Waste",
      construction: "Construction Waste",
      organic: "Organic Waste",
      mixed: "Mixed Waste",
      other: "Other",
    };

    return types[type] || type;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-tag">CITIZEN PORTAL</p>

          <h1>Citizen Dashboard</h1>

          <p>
            Track your garbage reports and help keep your community clean.
          </p>
        </div>

        <a href="/report" className="dashboard-report-btn">
          + Report Garbage
        </a>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">📋</span>

          <div>
            <p>Total Reports</p>
            <h2>{totalReports}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>

          <div>
            <p>Pending</p>
            <h2>{pendingReports}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>

          <div>
            <p>Resolved</p>
            <h2>{resolvedReports}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <div>
            <p className="dashboard-tag">YOUR ACTIVITY</p>

            <h2>My Garbage Reports</h2>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="reports-list">
            {reports.map((report) => (
              <div className="report-card" key={report.id}>
                <div className="report-card-image">
                  <img
                    src={report.image}
                    alt="Reported garbage"
                  />
                </div>

                <div className="report-card-content">
                  <div className="report-card-header">
                    <div>
                      <p className="report-id">
                        Report #{report.id}
                      </p>

                      <h3>
                        {getGarbageTypeName(report.garbageType)}
                      </h3>
                    </div>

                    <span className="report-status">
                      {report.status}
                    </span>
                  </div>

                  <p className="report-description">
                    {report.description}
                  </p>

                  <div className="report-location">
                    <strong>📍 Location</strong>

                    <p>
                      Latitude: {report.latitude}
                    </p>

                    <p>
                      Longitude: {report.longitude}
                    </p>
                  </div>

                  <p className="report-date">
                    📅 Submitted:{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>

                  {report.status === "Collected" &&
                    report.proofImage && (
                      <div className="citizen-proof">
                        <div className="citizen-proof-header">
                          <strong>✅ Garbage Collected</strong>

                          <span>
                            Collection proof uploaded by collector
                          </span>
                        </div>

                        <img
                          src={report.proofImage}
                          alt="Collector collection proof"
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-reports">
            <div className="empty-icon">🗑️</div>

            <h3>No reports yet</h3>

            <p>
              You haven't submitted any garbage reports yet.
              Report garbage in your area to help keep your community clean.
            </p>

            <a href="/report" className="empty-report-btn">
              Report Garbage
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default CitizenDashboard;