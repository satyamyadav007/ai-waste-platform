import { useState } from "react";
import ReportMap from "../components/ReportMap";

function AdminDashboard() {
  const [reports] = useState(() => {
    return (
      JSON.parse(
        localStorage.getItem("garbageReports")
      ) || []
    );
  });

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const collectedReports = reports.filter(
    (report) =>
      report.status === "Collected" ||
      report.status === "Resolved"
  ).length;

  const highPriorityReports = reports.filter(
    (report) =>
      report.aiResult &&
      report.aiResult.severity === "High" &&
      report.status === "Pending"
  ).length;

  const mediumPriorityReports = reports.filter(
    (report) =>
      report.aiResult &&
      report.aiResult.severity === "Medium" &&
      report.status === "Pending"
  ).length;

  const lowPriorityReports = reports.filter(
    (report) =>
      report.aiResult &&
      report.aiResult.severity === "Low" &&
      report.status === "Pending"
  ).length;

  const ratedReports = reports.filter(
    (report) => report.rating
  );

  const averageRating =
    ratedReports.length > 0
      ? (
          ratedReports.reduce(
            (total, report) =>
              total + Number(report.rating),
            0
          ) / ratedReports.length
        ).toFixed(1)
      : "0.0";

  function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
  ) {
    const earthRadius = 6371000;

    const lat1Radians =
      (lat1 * Math.PI) / 180;

    const lat2Radians =
      (lat2 * Math.PI) / 180;

    const latDifference =
      ((lat2 - lat1) * Math.PI) / 180;

    const lonDifference =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(latDifference / 2) *
        Math.sin(latDifference / 2) +
      Math.cos(lat1Radians) *
        Math.cos(lat2Radians) *
        Math.sin(lonDifference / 2) *
        Math.sin(lonDifference / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadius * c;
  }

  function findHotspots() {
    const hotspots = [];
    const usedReports = new Set();

    reports.forEach((report) => {
      if (
        report.latitude === undefined ||
        report.longitude === undefined
      ) {
        return;
      }

      if (usedReports.has(report.id)) {
        return;
      }

      const nearbyReports = reports.filter(
        (otherReport) => {
          if (
            otherReport.latitude === undefined ||
            otherReport.longitude === undefined
          ) {
            return false;
          }

          const distance =
            calculateDistance(
              Number(report.latitude),
              Number(report.longitude),
              Number(otherReport.latitude),
              Number(otherReport.longitude)
            );

          return distance <= 100;
        }
      );

      if (nearbyReports.length >= 3) {
        nearbyReports.forEach(
          (nearbyReport) => {
            usedReports.add(
              nearbyReport.id
            );
          }
        );

        hotspots.push({
          id: report.id,
          reportCount:
            nearbyReports.length,
        });
      }
    });

    return hotspots;
  }

  const hotspotCount =
    findHotspots().length;

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>
          <p className="dashboard-tag">
            ADMIN PORTAL
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor garbage reports, collection
            activity and AI-powered insights.
          </p>
        </div>

      </div>


      {/* ADMIN STATISTICS */}

      <div className="admin-stats">

        <div className="stat-card">
          <span className="stat-icon">
            📋
          </span>

          <div>
            <p>Total Reports</p>

            <h2>
              {totalReports}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">
            ⏳
          </span>

          <div>
            <p>Pending Reports</p>

            <h2>
              {pendingReports}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">
            ✅
          </span>

          <div>
            <p>Collected Reports</p>

            <h2>
              {collectedReports}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">
            🚨
          </span>

          <div>
            <p>High Priority</p>

            <h2>
              {highPriorityReports}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">
            🔥
          </span>

          <div>
            <p>Hotspots</p>

            <h2>
              {hotspotCount}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">
            ⭐
          </span>

          <div>
            <p>Average Rating</p>

            <h2>
              {averageRating}
            </h2>
          </div>
        </div>

      </div>


      {/* PRIORITY OVERVIEW */}

      <div className="admin-overview">

        <div className="overview-card">

          <div className="overview-header">

            <div>
              <p className="dashboard-tag">
                AI PRIORITY
              </p>

              <h2>
                Priority Overview
              </h2>
            </div>

            <span className="overview-icon">
              🤖
            </span>

          </div>


          <div className="priority-overview-grid">

            <div className="priority-overview-item high">

              <div className="priority-overview-icon">
                🔴
              </div>

              <div>
                <p>
                  High Priority
                </p>

                <h3>
                  {highPriorityReports}
                </h3>

                <span>
                  Pending reports
                </span>
              </div>

            </div>


            <div className="priority-overview-item medium">

              <div className="priority-overview-icon">
                🟠
              </div>

              <div>
                <p>
                  Medium Priority
                </p>

                <h3>
                  {mediumPriorityReports}
                </h3>

                <span>
                  Pending reports
                </span>
              </div>

            </div>


            <div className="priority-overview-item low">

              <div className="priority-overview-icon">
                🟢
              </div>

              <div>
                <p>
                  Low Priority
                </p>

                <h3>
                  {lowPriorityReports}
                </h3>

                <span>
                  Pending reports
                </span>
              </div>

            </div>

          </div>

        </div>


        <div className="overview-card">

          <div className="overview-header">

            <div>
              <p className="dashboard-tag">
                COLLECTION
              </p>

              <h2>
                Collection Status
              </h2>
            </div>

            <span className="overview-icon">
              🚛
            </span>

          </div>


          <div className="collection-overview">

            <div className="collection-overview-item">

              <div className="collection-icon pending">
                ⏳
              </div>

              <div>
                <p>
                  Pending Collection
                </p>

                <h3>
                  {pendingReports}
                </h3>

                <span>
                  Reports waiting for collection
                </span>
              </div>

            </div>


            <div className="collection-overview-item">

              <div className="collection-icon collected">
                ✅
              </div>

              <div>
                <p>
                  Collected / Resolved
                </p>

                <h3>
                  {collectedReports}
                </h3>

                <span>
                  Reports completed
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ADMIN MAP */}

      <div className="reports-section">

        <div className="section-title">

          <div>
            <p className="dashboard-tag">
              LIVE MONITORING
            </p>

            <h2>
              Garbage Reports Map
            </h2>

            <p>
              Monitor reported garbage locations
              and their AI-based priority.
            </p>
          </div>

        </div>


        <ReportMap showFilters={true} />

      </div>


      {/* RECENT ACTIVITY */}

      <div className="reports-section">

        <div className="section-title">

          <div>
            <p className="dashboard-tag">
              RECENT ACTIVITY
            </p>

            <h2>
              Recent Garbage Reports
            </h2>
          </div>

        </div>


        {reports.length > 0 ? (

          <div className="reports-list">

            {[...reports]
              .reverse()
              .slice(0, 5)
              .map((report) => (

                <div
                  className="report-card"
                  key={report.id}
                >

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
                          {report.garbageType}
                        </h3>

                      </div>


                      <span className="report-status">
                        {report.status}
                      </span>

                    </div>


                    <p className="report-description">
                      {report.description}
                    </p>


                    {report.aiResult && (

                      <div className="collector-ai-box">

                        <div className="collector-ai-header">

                          <h3>
                            🤖 AI Analysis
                          </h3>

                          <span className="ai-priority">
                            {report.aiResult.severity} Priority
                          </span>

                        </div>


                        <p>
                          <strong>
                            Garbage Detected:
                          </strong>{" "}

                          {report.aiResult
                            .garbageDetected
                            ? "Yes"
                            : "No"}
                        </p>


                        <p>
                          <strong>
                            Confidence:
                          </strong>{" "}

                          {report.aiResult.confidence}%
                        </p>


                        <p>
                          <strong>
                            Severity:
                          </strong>{" "}

                          {report.aiResult.severity}
                        </p>

                      </div>
                    )}


                    <div className="report-location">

                      <strong>
                        📍 Location
                      </strong>

                      <p>
                        Latitude:{" "}
                        {report.latitude}
                      </p>

                      <p>
                        Longitude:{" "}
                        {report.longitude}
                      </p>

                    </div>


                    <p className="report-date">
                      📅 Submitted:{" "}

                      {new Date(
                        report.createdAt
                      ).toLocaleString()}
                    </p>


                    {report.rating && (

                      <div className="admin-rating">

                        <strong>
                          ⭐ Citizen Rating:
                        </strong>{" "}

                        {report.rating}/5

                        {report.feedback && (
                          <p>
                            Feedback:{" "}

                            {report.feedback}
                          </p>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              ))}

          </div>

        ) : (

          <div className="empty-reports">

            <div className="empty-icon">
              🗑️
            </div>

            <h3>
              No reports available
            </h3>

            <p>
              There are currently no garbage
              reports in the system.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;