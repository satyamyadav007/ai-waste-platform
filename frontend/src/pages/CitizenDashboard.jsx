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

  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});

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

  function handleRating(reportId) {
    const selectedRating = ratings[reportId];

    if (!selectedRating) {
      alert("Please select a rating first.");
      return;
    }

    const allReports =
      JSON.parse(localStorage.getItem("garbageReports")) || [];

    const updatedReports = allReports.map((report) => {
      if (report.id === reportId) {
        return {
          ...report,
          rating: selectedRating,
          feedback: feedback[reportId] || "",
        };
      }

      return report;
    });

    localStorage.setItem(
      "garbageReports",
      JSON.stringify(updatedReports)
    );

    alert("Thank you! Your rating has been submitted.");

    window.location.reload();
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

                  {report.status === "Collected" && (
                    <div className="rating-section">
                      <h3>⭐ Rate Collector</h3>

                      {report.rating ? (
                        <div className="rating-submitted">
                          <strong>
                            Your Rating: {report.rating}/5 ⭐
                          </strong>

                          {report.feedback && (
                            <p>
                              Your Feedback: {report.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setRatings(
                                    (previousRatings) => ({
                                      ...previousRatings,
                                      [report.id]: star,
                                    })
                                  )
                                }
                                className={
                                  ratings[report.id] >= star
                                    ? "star active"
                                    : "star"
                                }
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            placeholder="Write optional feedback..."
                            value={
                              feedback[report.id] || ""
                            }
                            onChange={(event) =>
                              setFeedback(
                                (previousFeedback) => ({
                                  ...previousFeedback,
                                  [report.id]:
                                    event.target.value,
                                })
                              )
                            }
                            rows="3"
                          ></textarea>

                          <button
                            type="button"
                            className="submit-rating-button"
                            onClick={() =>
                              handleRating(report.id)
                            }
                          >
                            Submit Rating
                          </button>
                        </>
                      )}
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