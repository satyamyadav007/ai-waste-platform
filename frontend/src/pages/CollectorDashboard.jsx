import { useState } from "react";

function CollectorDashboard() {
  const [reports, setReports] = useState(() => {
    return JSON.parse(localStorage.getItem("garbageReports")) || [];
  });

  const [proofImages, setProofImages] = useState({});

  function handleProofImageChange(event, reportId) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProofImages((previousImages) => ({
      ...previousImages,
      [reportId]: imageUrl,
    }));
  }

  function handleCollected(reportId) {
    const proofImage = proofImages[reportId];

    if (!proofImage) {
      alert("Please upload a collection proof image first.");
      return;
    }

    const updatedReports = reports.map((report) => {
      if (report.id === reportId) {
        return {
          ...report,
          status: "Collected",
          proofImage: proofImage,
        };
      }

      return report;
    });

    localStorage.setItem(
      "garbageReports",
      JSON.stringify(updatedReports)
    );

    setReports(updatedReports);

    alert("Garbage marked as collected!");
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-tag">COLLECTOR PORTAL</p>

          <h1>Collector Dashboard</h1>

          <p>
            View garbage reports submitted by citizens and manage
            collection activities.
          </p>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <div>
            <p className="dashboard-tag">GARBAGE REPORTS</p>

            <h2>Reports to Collect</h2>
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

                      <h3>{report.garbageType}</h3>
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

                  {report.status === "Pending" && (
                    <div className="collector-action">
                      <label className="proof-upload">
                        📷 Upload Collection Proof

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleProofImageChange(
                              event,
                              report.id
                            )
                          }
                          hidden
                        />
                      </label>

                      {proofImages[report.id] && (
                        <div className="proof-preview">
                          <img
                            src={proofImages[report.id]}
                            alt="Collection proof"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="collect-button"
                        onClick={() =>
                          handleCollected(report.id)
                        }
                      >
                        ✅ Mark as Collected
                      </button>
                    </div>
                  )}

                  {report.status === "Collected" &&
                    report.proofImage && (
                      <div className="proof-preview">
                        <strong>Collection Proof</strong>

                        <img
                          src={report.proofImage}
                          alt="Collection proof"
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

            <h3>No garbage reports</h3>

            <p>
              There are currently no garbage reports submitted
              by citizens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectorDashboard;