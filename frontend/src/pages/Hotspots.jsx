import { useState } from "react";

function Hotspots() {
  const [reports] = useState(() => {
    return (
      JSON.parse(
        localStorage.getItem("garbageReports")
      ) || []
    );
  });

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

        const highPriorityCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.aiResult &&
              nearbyReport.aiResult
                .severity === "High"
          ).length;

        let riskLevel = "Low";

        if (
          nearbyReports.length >= 5 ||
          highPriorityCount >= 2
        ) {
          riskLevel = "High";
        } else if (
          nearbyReports.length >= 3
        ) {
          riskLevel = "Medium";
        }

        hotspots.push({
          id: report.id,
          latitude: report.latitude,
          longitude: report.longitude,
          reportCount:
            nearbyReports.length,
          highPriorityCount:
            highPriorityCount,
          riskLevel: riskLevel,
        });
      }
    });

    return hotspots;
  }

  const hotspots = findHotspots();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-tag">
            AI INSIGHTS
          </p>

          <h1>Garbage Hotspots</h1>

          <p>
            Identify areas where garbage complaints
            are repeatedly reported.
          </p>
        </div>
      </div>

      <div className="hotspot-summary">
        <div className="stat-card">
          <span className="stat-icon">
            🔥
          </span>

          <div>
            <p>Hotspots Detected</p>
            <h2>{hotspots.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">
            📋
          </span>

          <div>
            <p>Total Reports</p>
            <h2>{reports.length}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <div>
            <p className="dashboard-tag">
              RECURRING AREAS
            </p>

            <h2>Detected Hotspots</h2>
          </div>
        </div>

        {hotspots.length > 0 ? (
          <div className="hotspot-list">
            {hotspots.map((hotspot) => (
              <div
                className="hotspot-card"
                key={hotspot.id}
              >
                <div className="hotspot-icon">
                  🔥
                </div>

                <div className="hotspot-content">
                  <div className="hotspot-header">
                    <div>
                      <p className="report-id">
                        HOTSPOT #{hotspot.id}
                      </p>

                      <h3>
                        Recurring Garbage Area
                      </h3>
                    </div>

                    <span
                      className={`hotspot-risk ${hotspot.riskLevel.toLowerCase()}`}
                    >
                      {hotspot.riskLevel} Risk
                    </span>
                  </div>

                  <div className="hotspot-info">
                    <p>
                      <strong>
                        📍 Latitude:
                      </strong>{" "}
                      {hotspot.latitude}
                    </p>

                    <p>
                      <strong>
                        📍 Longitude:
                      </strong>{" "}
                      {hotspot.longitude}
                    </p>

                    <p>
                      <strong>
                        📋 Reports within 100m:
                      </strong>{" "}
                      {hotspot.reportCount}
                    </p>

                    <p>
                      <strong>
                        🚨 High-priority reports:
                      </strong>{" "}
                      {hotspot.highPriorityCount}
                    </p>
                  </div>

                  <div className="hotspot-message">
                    <strong>
                      💡 Insight
                    </strong>

                    <p>
                      This area has received multiple
                      garbage complaints and may require
                      preventive action.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-reports">
            <div className="empty-icon">
              🗺️
            </div>

            <h3>
              No hotspots detected
            </h3>

            <p>
              At least 3 garbage reports within
              100 meters are required to identify
              a recurring hotspot.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hotspots;