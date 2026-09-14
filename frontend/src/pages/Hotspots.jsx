import { useEffect, useState } from "react";
import ReportMap from "../components/ReportMap";

function Hotspots() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH REPORTS FROM MONGODB
  // --------------------------------------------------

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://ai-waste-platform.onrender.com/api/reports"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch reports."
          );
        }

        const normalizedReports =
          data.map((report) => ({
            ...report,

            id:
              report.reportId ||
              report._id,
          }));

        setReports(
          normalizedReports
        );

        console.log(
          "Hotspot reports loaded from MongoDB:",
          normalizedReports.length
        );

      } catch (error) {
        console.error(
          "Hotspot reports fetch error:",
          error
        );

        setError(
          "Unable to load hotspot reports from MongoDB."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // --------------------------------------------------
  // CALCULATE DISTANCE
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
  // FIND HOTSPOTS
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

      if (
        usedReports.has(report.id)
      ) {
        return;
      }

      const nearbyReports =
        reports.filter(
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

      // At least 3 reports are needed
      // to create a recurring hotspot.
      if (
        nearbyReports.length >= 3
      ) {

        nearbyReports.forEach(
          (nearbyReport) => {
            usedReports.add(
              nearbyReport.id
            );
          }
        );

        // --------------------------------------------------
        // CONTEXT-AWARE COUNTS
        // --------------------------------------------------

        const highPriorityCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.priority ===
              "High"
          ).length;

        const mediumPriorityCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.priority ===
              "Medium"
          ).length;

        const sensitiveLocationCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.sensitiveLocationType &&
              nearbyReport.sensitiveLocationType !==
                "None"
          ).length;

        const hospitalCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.sensitiveLocationType ===
              "Hospital / Clinic"
          ).length;

        const waterBodyCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.sensitiveLocationType ===
              "River / Lake / Pond"
          ).length;

        const schoolCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.sensitiveLocationType ===
                "School" ||
              nearbyReport.sensitiveLocationType ===
                "College / University"
          ).length;

        const pendingCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.status ===
              "Pending"
          ).length;

        const collectedCount =
          nearbyReports.filter(
            (nearbyReport) =>
              nearbyReport.status ===
                "Collected" ||
              nearbyReport.status ===
                "Resolved"
          ).length;

        // --------------------------------------------------
        // HOTSPOT RISK SCORE
        // --------------------------------------------------

        let riskScore = 0;

        // Number of reports
        if (
          nearbyReports.length >= 7
        ) {
          riskScore += 4;
        } else if (
          nearbyReports.length >= 5
        ) {
          riskScore += 3;
        } else {
          riskScore += 2;
        }

        // High-priority reports
        riskScore += Math.min(
          highPriorityCount * 2,
          6
        );

        // Medium-priority reports
        riskScore += Math.min(
          mediumPriorityCount,
          2
        );

        // Sensitive location context
        if (
          sensitiveLocationCount >= 3
        ) {
          riskScore += 3;
        } else if (
          sensitiveLocationCount >= 1
        ) {
          riskScore += 2;
        }

        // Hospital / water-body context
        if (
          hospitalCount > 0
        ) {
          riskScore += 3;
        }

        if (
          waterBodyCount > 0
        ) {
          riskScore += 3;
        }

        // --------------------------------------------------
        // DETERMINE RISK
        // --------------------------------------------------

        let riskLevel = "Low";

        if (
          riskScore >= 9
        ) {
          riskLevel = "Critical";
        } else if (
          riskScore >= 6
        ) {
          riskLevel = "High";
        } else if (
          riskScore >= 3
        ) {
          riskLevel = "Medium";
        }

        // --------------------------------------------------
        // DETERMINE PRIMARY CONTEXT
        // --------------------------------------------------

        let primaryContext =
          "No sensitive-location context reported";

        if (
          hospitalCount > 0
        ) {
          primaryContext =
            "Hospital / Clinic";
        } else if (
          waterBodyCount > 0
        ) {
          primaryContext =
            "River / Lake / Pond";
        } else if (
          schoolCount > 0
        ) {
          primaryContext =
            "School / College";
        } else if (
          sensitiveLocationCount > 0
        ) {
          primaryContext =
            "Sensitive location";
        }

        hotspots.push({
          id:
            report.id,

          latitude:
            report.latitude,

          longitude:
            report.longitude,

          reportCount:
            nearbyReports.length,

          highPriorityCount:
            highPriorityCount,

          mediumPriorityCount:
            mediumPriorityCount,

          sensitiveLocationCount:
            sensitiveLocationCount,

          hospitalCount:
            hospitalCount,

          waterBodyCount:
            waterBodyCount,

          schoolCount:
            schoolCount,

          pendingCount:
            pendingCount,

          collectedCount:
            collectedCount,

          riskScore:
            riskScore,

          riskLevel:
            riskLevel,

          primaryContext:
            primaryContext,

          reports:
            nearbyReports,
        });
      }
    });

    return hotspots;
  }

  const hotspots =
    findHotspots();

  // --------------------------------------------------
  // RISK ICON
  // --------------------------------------------------

  function getRiskIcon(
    riskLevel
  ) {
    if (
      riskLevel === "Critical"
    ) {
      return "🚨";
    }

    if (
      riskLevel === "High"
    ) {
      return "🔴";
    }

    if (
      riskLevel === "Medium"
    ) {
      return "🟠";
    }

    return "🟢";
  }

  // --------------------------------------------------
  // RISK CLASS
  // --------------------------------------------------

  function getRiskClass(
    riskLevel
  ) {
    return riskLevel.toLowerCase();
  }

  // --------------------------------------------------
  // HOTSPOT INSIGHT
  // --------------------------------------------------

  function getHotspotInsight(
    hotspot
  ) {
    if (
      hotspot.hospitalCount > 0
    ) {
      return "This hotspot includes reports near a hospital or clinic. Faster response may help reduce potential public-health impact.";
    }

    if (
      hotspot.waterBodyCount > 0
    ) {
      return "This hotspot includes reports near a water body. Preventive action may help reduce environmental contamination.";
    }

    if (
      hotspot.highPriorityCount >= 2
    ) {
      return "Multiple high-priority reports are concentrated here. This area should receive faster collection attention.";
    }

    if (
      hotspot.sensitiveLocationCount > 0
    ) {
      return "Sensitive-location context has been reported in this cluster, increasing the importance of preventive action.";
    }

    if (
      hotspot.reportCount >= 5
    ) {
      return "A high number of reports is concentrated within 100 metres, suggesting a recurring waste problem.";
    }

    return "Multiple garbage complaints are concentrated within 100 metres and may require preventive action.";
  }

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <p className="dashboard-tag">
              AI INSIGHTS
            </p>

            <h1>
              Garbage Hotspots
            </h1>

            <p>
              Loading hotspot data from MongoDB...
            </p>

          </div>

        </div>

        <div className="empty-reports">

          <div className="empty-icon">
            🔥
          </div>

          <h3>
            Loading Hotspots
          </h3>

          <p>
            Please wait while garbage reports
            are being loaded.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <p className="dashboard-tag">
              AI INSIGHTS
            </p>

            <h1>
              Garbage Hotspots
            </h1>

            <p>
              Identify areas where garbage complaints
              are repeatedly reported.
            </p>

          </div>

        </div>

        <div className="empty-reports">

          <div className="empty-icon">
            ⚠️
          </div>

          <h3>
            Unable to Load Hotspots
          </h3>

          <p>
            {error}
          </p>

          <p>
            Make sure the backend server is running.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div className="dashboard-header">

        <div>

          <p className="dashboard-tag">
            AI INSIGHTS
          </p>

          <h1>
            Garbage Hotspots
          </h1>

          <p>
            Identify recurring waste areas using
            report frequency, priority, and location context.
          </p>

        </div>

      </div>


      {/* --------------------------------------------------
          MAP
      -------------------------------------------------- */}

      <ReportMap />


      {/* --------------------------------------------------
          HOTSPOT SUMMARY
      -------------------------------------------------- */}

      <div className="hotspot-summary">

        <div className="stat-card">

          <span className="stat-icon">
            🔥
          </span>

          <div>

            <p>
              Hotspots Detected
            </p>

            <h2>
              {hotspots.length}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            🚨
          </span>

          <div>

            <p>
              High / Critical
            </p>

            <h2>
              {
                hotspots.filter(
                  (hotspot) =>
                    hotspot.riskLevel ===
                      "High" ||
                    hotspot.riskLevel ===
                      "Critical"
                ).length
              }
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            ⚠️
          </span>

          <div>

            <p>
              Context-Aware Hotspots
            </p>

            <h2>
              {
                hotspots.filter(
                  (hotspot) =>
                    hotspot.sensitiveLocationCount >
                    0
                ).length
              }
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            📋
          </span>

          <div>

            <p>
              Total Reports
            </p>

            <h2>
              {reports.length}
            </h2>

          </div>

        </div>

      </div>


      {/* --------------------------------------------------
          HOTSPOT LIST
      -------------------------------------------------- */}

      <div className="reports-section">

        <div className="section-title">

          <div>

            <p className="dashboard-tag">
              SMART HOTSPOT INTELLIGENCE
            </p>

            <h2>
              Detected Hotspots
            </h2>

            <p>
              Risk is calculated using report
              concentration, context-aware priority,
              and sensitive-location information.
            </p>

          </div>

        </div>


        {hotspots.length > 0 ? (

          <div className="hotspot-list">

            {hotspots.map(
              (hotspot, index) => (

                <div
                  className="hotspot-card"
                  key={hotspot.id}
                >

                  <div className="hotspot-icon">
                    {getRiskIcon(
                      hotspot.riskLevel
                    )}
                  </div>


                  <div className="hotspot-content">

                    {/* HEADER */}

                    <div className="hotspot-header">

                      <div>

                        <p className="report-id">
                          HOTSPOT #{index + 1}
                        </p>

                        <h3>
                          Recurring Garbage Area
                        </h3>

                      </div>

                      <span
                        className={`hotspot-risk ${getRiskClass(
                          hotspot.riskLevel
                        )}`}
                      >
                        {hotspot.riskLevel} Risk
                      </span>

                    </div>


                    {/* RISK SCORE */}

                    <div className="hotspot-risk-score">

                      <div>

                        <span>
                          Risk Score
                        </span>

                        <strong>
                          {hotspot.riskScore}
                        </strong>

                      </div>

                      <div className="hotspot-primary-context">

                        <span>
                          Primary Context
                        </span>

                        <strong>
                          {hotspot.primaryContext}
                        </strong>

                      </div>

                    </div>


                    {/* INFORMATION */}

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

                      <p>
                        <strong>
                          🟠 Medium-priority reports:
                        </strong>{" "}
                        {hotspot.mediumPriorityCount}
                      </p>

                    </div>


                    {/* CONTEXT */}

                    <div className="hotspot-context">

                      <h4>
                        🌍 Location Context
                      </h4>

                      <div className="hotspot-context-grid">

                        <div>
                          <span>
                            ⚠️
                          </span>

                          <p>
                            Sensitive
                          </p>

                          <strong>
                            {
                              hotspot.sensitiveLocationCount
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            🏥
                          </span>

                          <p>
                            Hospitals
                          </p>

                          <strong>
                            {
                              hotspot.hospitalCount
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            🌊
                          </span>

                          <p>
                            Water Bodies
                          </p>

                          <strong>
                            {
                              hotspot.waterBodyCount
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            🏫
                          </span>

                          <p>
                            Schools
                          </p>

                          <strong>
                            {
                              hotspot.schoolCount
                            }
                          </strong>
                        </div>

                      </div>

                    </div>


                    {/* STATUS */}

                    <div className="hotspot-status-grid">

                      <div>

                        <span>
                          ⏳
                        </span>

                        <p>
                          Pending
                        </p>

                        <strong>
                          {
                            hotspot.pendingCount
                          }
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
                          {
                            hotspot.collectedCount
                          }
                        </strong>

                      </div>

                    </div>


                    {/* INSIGHT */}

                    <div className="hotspot-message">

                      <strong>
                        💡 AI Insight
                      </strong>

                      <p>
                        {
                          getHotspotInsight(
                            hotspot
                          )
                        }
                      </p>

                    </div>


                    {/* FUTURE PREVENTION */}

                    <div className="hotspot-prevention">

                      <strong>
                        🛡️ Recommended Action
                      </strong>

                      {hotspot.riskLevel ===
                        "Critical" && (

                        <p>
                          Immediate collection response
                          and on-site assessment recommended.
                        </p>

                      )}

                      {hotspot.riskLevel ===
                        "High" && (

                        <p>
                          Prioritize this area for faster
                          collection and preventive monitoring.
                        </p>

                      )}

                      {hotspot.riskLevel ===
                        "Medium" && (

                        <p>
                          Schedule timely collection and
                          monitor the area for repeated complaints.
                        </p>

                      )}

                      {hotspot.riskLevel ===
                        "Low" && (

                        <p>
                          Continue monitoring and investigate
                          recurring causes if reports increase.
                        </p>

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

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