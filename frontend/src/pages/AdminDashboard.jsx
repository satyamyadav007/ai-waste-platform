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


  // --------------------------------------------------
  // DISTANCE CALCULATION
  // --------------------------------------------------

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


  // --------------------------------------------------
  // FIND BASIC HOTSPOTS
  // --------------------------------------------------

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
          reports: nearbyReports,
          reportCount:
            nearbyReports.length,
        });
      }
    });

    return hotspots;
  }


  // --------------------------------------------------
  // HOTSPOT INTELLIGENCE
  // --------------------------------------------------

  function getHotspotRisk(
    reportCount,
    highPriorityCount
  ) {
    if (
      reportCount >= 5 ||
      highPriorityCount >= 2
    ) {
      return "High";
    }

    if (reportCount >= 3) {
      return "Medium";
    }

    return "Low";
  }


  function getMostCommonGarbage(
    hotspotReports
  ) {
    const garbageCounts = {};

    hotspotReports.forEach(
      (report) => {
        const garbageType =
          report.garbageType ||
          "Unknown";

        garbageCounts[garbageType] =
          (garbageCounts[garbageType] || 0) + 1;
      }
    );

    let mostCommon =
      "Unknown";

    let highestCount = 0;

    Object.entries(
      garbageCounts
    ).forEach(
      ([garbageType, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostCommon = garbageType;
        }
      }
    );

    return mostCommon;
  }


  const hotspotData =
    findHotspots().map(
      (hotspot, index) => {

        const highPriorityCount =
          hotspot.reports.filter(
            (report) =>
              report.aiResult &&
              report.aiResult.severity ===
                "High" &&
              report.status === "Pending"
          ).length;

        const pendingCount =
          hotspot.reports.filter(
            (report) =>
              report.status === "Pending"
          ).length;

        const collectedCount =
          hotspot.reports.filter(
            (report) =>
              report.status ===
                "Collected" ||
              report.status === "Resolved"
          ).length;

        const riskLevel =
          getHotspotRisk(
            hotspot.reportCount,
            highPriorityCount
          );

        const commonGarbage =
          getMostCommonGarbage(
            hotspot.reports
          );

        const firstReport =
          hotspot.reports[0];

        return {
          number: index + 1,

          id: hotspot.id,

          reportCount:
            hotspot.reportCount,

          highPriorityCount,

          pendingCount,

          collectedCount,

          riskLevel,

          commonGarbage,

          latitude:
            firstReport.latitude,

          longitude:
            firstReport.longitude,

          reports:
            hotspot.reports,
        };
      }
    );


  const hotspotCount =
    hotspotData.length;


  return (
    <div className="dashboard-page">

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

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


      {/* --------------------------------------------------
          ADMIN STATISTICS
      -------------------------------------------------- */}

      <div className="admin-stats">

        <div className="stat-card">

          <span className="stat-icon">
            📋
          </span>

          <div>

            <p>
              Total Reports
            </p>

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

            <p>
              Pending Reports
            </p>

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

            <p>
              Collected Reports
            </p>

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

            <p>
              High Priority
            </p>

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

            <p>
              Hotspots
            </p>

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

            <p>
              Average Rating
            </p>

            <h2>
              {averageRating}
            </h2>

          </div>

        </div>

      </div>


      {/* --------------------------------------------------
          PRIORITY + COLLECTION OVERVIEW
      -------------------------------------------------- */}

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


      {/* --------------------------------------------------
          HOTSPOT INTELLIGENCE
      -------------------------------------------------- */}

      <div className="reports-section">

        <div className="section-title">

          <div>

            <p className="dashboard-tag">
              SMART ANALYTICS
            </p>

            <h2>
              Hotspot Intelligence
            </h2>

            <p>
              Analyze recurring garbage clusters
              and identify areas that need attention.
            </p>

          </div>

        </div>


        {hotspotData.length > 0 ? (

          <div className="hotspot-intelligence-grid">

            {hotspotData.map(
              (hotspot) => (

                <div
                  className="hotspot-intelligence-card"
                  key={hotspot.id}
                >

                  <div className="hotspot-card-header">

                    <div>

                      <span className="hotspot-card-number">
                        🔥 Hotspot #{hotspot.number}
                      </span>

                      <h3>
                        {hotspot.riskLevel} Risk
                      </h3>

                    </div>

                    <span
                      className={`hotspot-risk-badge ${hotspot.riskLevel.toLowerCase()}`}
                    >
                      {hotspot.riskLevel}
                    </span>

                  </div>


                  <div className="hotspot-main-count">

                    <strong>
                      {hotspot.reportCount}
                    </strong>

                    <span>
                      Reports within 100m
                    </span>

                  </div>


                  <div className="hotspot-details-grid">

                    <div>

                      <span>
                        ⏳
                      </span>

                      <p>
                        Pending
                      </p>

                      <strong>
                        {hotspot.pendingCount}
                      </strong>

                    </div>


                    <div>

                      <span>
                        ✅
                      </span>

                      <p>
                        Collected
                      </p>

                      <strong>
                        {hotspot.collectedCount}
                      </strong>

                    </div>


                    <div>

                      <span>
                        🚨
                      </span>

                      <p>
                        High Priority
                      </p>

                      <strong>
                        {hotspot.highPriorityCount}
                      </strong>

                    </div>


                    <div>

                      <span>
                        🗑️
                      </span>

                      <p>
                        Common Garbage
                      </p>

                      <strong>
                        {hotspot.commonGarbage}
                      </strong>

                    </div>

                  </div>


                  <div className="hotspot-location">

                    <strong>
                      📍 Location
                    </strong>

                    <p>
                      {hotspot.latitude},{" "}
                      {hotspot.longitude}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="empty-reports">

            <div className="empty-icon">
              🔥
            </div>

            <h3>
              No hotspots detected
            </h3>

            <p>
              Hotspots will appear when at least
              3 reports are located within 100 meters.
            </p>

          </div>

        )}

      </div>


      {/* --------------------------------------------------
          ADMIN MAP
      -------------------------------------------------- */}

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


      {/* --------------------------------------------------
          RECENT ACTIVITY
      -------------------------------------------------- */}

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