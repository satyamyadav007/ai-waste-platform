import { useEffect, useState } from "react";

function CitizenDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});

  // --------------------------------------------------
  // FETCH CITIZEN REPORTS FROM MONGODB
  // --------------------------------------------------

  useEffect(() => {
    async function fetchReports() {
      try {
        const loggedInUser =
          JSON.parse(
            localStorage.getItem(
              "loggedInUser"
            )
          );

        if (!loggedInUser) {
          setReports([]);
          setLoading(false);
          return;
        }

        const response =
          await fetch(
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

        // --------------------------------------------------
        // ONLY SHOW CURRENT CITIZEN'S REPORTS
        // --------------------------------------------------

        const citizenReports =
          data
            .filter(
              (report) =>
                report.userEmail &&
                report.userEmail.toLowerCase() ===
                  loggedInUser.email.toLowerCase()
            )
            .map(
              (report) => ({
                ...report,

                id:
                  report.reportId ||
                  report._id,
              })
            );

        setReports(
          citizenReports
        );

        console.log(
          "Citizen reports loaded from MongoDB:",
          citizenReports.length
        );

      } catch (error) {
        console.error(
          "Citizen reports fetch error:",
          error
        );

        setError(
          "Unable to load your reports from MongoDB."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // --------------------------------------------------
  // SUBMIT RATING
  // --------------------------------------------------

  async function handleRating(
    reportId
  ) {
    const selectedRating =
      ratings[reportId];

    if (!selectedRating) {
      alert(
        "Please select a rating first."
      );

      return;
    }

    const selectedFeedback =
      feedback[reportId] || "";

    try {
      console.log(
        "Saving rating to MongoDB..."
      );

      const response =
        await fetch(
          `https://ai-waste-platform.onrender.com/api/reports/${reportId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              rating:
                selectedRating,

              feedback:
                selectedFeedback,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to submit rating."
        );

        return;
      }

      // --------------------------------------------------
      // UPDATE FRONTEND STATE
      // --------------------------------------------------

      const updatedReports =
        reports.map(
          (report) => {
            if (
              report.id ===
              reportId
            ) {
              return {
                ...report,

                rating:
                  selectedRating,

                feedback:
                  selectedFeedback,
              };
            }

            return report;
          }
        );

      setReports(
        updatedReports
      );

      alert(
        "Thank you! Your rating has been submitted."
      );

    } catch (error) {
      console.error(
        "Rating update error:",
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  }

  // --------------------------------------------------
  // GARBAGE TYPE NAME
  // --------------------------------------------------

  function getGarbageTypeName(
    type
  ) {
    const types = {
      household:
        "Household Waste",

      plastic:
        "Plastic Waste",

      construction:
        "Construction Waste",

      organic:
        "Organic Waste",

      mixed:
        "Mixed Waste",

      other:
        "Other",
    };

    return (
      types[type] ||
      type
    );
  }

  // --------------------------------------------------
  // PRIORITY CLASS
  // --------------------------------------------------

  function getPriorityClass(
    priority
  ) {
    if (
      priority === "High"
    ) {
      return "priority-high";
    }

    if (
      priority === "Medium"
    ) {
      return "priority-medium";
    }

    if (
      priority === "Low"
    ) {
      return "priority-low";
    }

    return "priority-unknown";
  }

  // --------------------------------------------------
  // PRIORITY ICON
  // --------------------------------------------------

  function getPriorityIcon(
    priority
  ) {
    if (
      priority === "High"
    ) {
      return "🔴";
    }

    if (
      priority === "Medium"
    ) {
      return "🟠";
    }

    if (
      priority === "Low"
    ) {
      return "🟢";
    }

    return "⚪";
  }

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalReports =
    reports.length;

  const pendingReports =
    reports.filter(
      (report) =>
        report.status ===
        "Pending"
    ).length;

  const resolvedReports =
    reports.filter(
      (report) =>
        report.status ===
          "Collected" ||
        report.status ===
          "Resolved"
    ).length;

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <p className="dashboard-tag">
              CITIZEN PORTAL
            </p>

            <h1>
              Citizen Dashboard
            </h1>

            <p>
              Loading your reports from MongoDB...
            </p>

          </div>

        </div>

        <div className="empty-reports">

          <div className="empty-icon">
            📊
          </div>

          <h3>
            Loading Reports
          </h3>

          <p>
            Please wait while your
            reports are being loaded.
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
              CITIZEN PORTAL
            </p>

            <h1>
              Citizen Dashboard
            </h1>

            <p>
              Track your garbage reports
              and help keep your community clean.
            </p>

          </div>

        </div>

        <div className="empty-reports">

          <div className="empty-icon">
            ⚠️
          </div>

          <h3>
            Unable to Load Reports
          </h3>

          <p>
            {error}
          </p>

          <p>
            Make sure the backend server
            is running.
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
            CITIZEN PORTAL
          </p>

          <h1>
            Citizen Dashboard
          </h1>

          <p>
            Track your garbage reports
            and help keep your community clean.
          </p>

        </div>

        <a
          href="/report"
          className="dashboard-report-btn"
        >
          + Report Garbage
        </a>

      </div>

      {/* --------------------------------------------------
          STATISTICS
      -------------------------------------------------- */}

      <div className="dashboard-stats">

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
              Pending
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
              Resolved
            </p>

            <h2>
              {resolvedReports}
            </h2>

          </div>

        </div>

      </div>

      {/* --------------------------------------------------
          MY REPORTS
      -------------------------------------------------- */}

      <div className="reports-section">

        <div className="section-title">

          <div>

            <p className="dashboard-tag">
              YOUR ACTIVITY
            </p>

            <h2>
              My Garbage Reports
            </h2>

          </div>

        </div>

        {reports.length > 0 ? (

          <div className="reports-list">

            {reports.map(
              (report) => (

                <div
                  className="report-card"
                  key={
                    report.id
                  }
                >

                  {/* --------------------------------------------------
                      REPORT IMAGE
                  -------------------------------------------------- */}

                  <div className="report-card-image">

                    <img
                      src={
                        report.originalImageData ||
                        report.image
                      }
                      alt="Reported garbage"
                    />

                  </div>

                  {/* --------------------------------------------------
                      REPORT CONTENT
                  -------------------------------------------------- */}

                  <div className="report-card-content">

                    {/* HEADER */}

                    <div className="report-card-header">

                      <div>

                        <p className="report-id">
                          Report #{report.id}
                        </p>

                        <h3>
                          {
                            getGarbageTypeName(
                              report.garbageType
                            )
                          }
                        </h3>

                      </div>

                      <span className="report-status">
                        {
                          report.status
                        }
                      </span>

                    </div>


                    {/* --------------------------------------------------
                        PRIORITY
                    -------------------------------------------------- */}

                    <div className="report-priority-box">

                      <div className="report-priority-header">

                        <strong>
                          Context-Aware Priority
                        </strong>

                        {report.priority ? (

                          <span
                            className={`priority-badge ${getPriorityClass(
                              report.priority
                            )}`}
                          >
                            {getPriorityIcon(
                              report.priority
                            )}{" "}
                            {report.priority}
                          </span>

                        ) : (

                          <span className="priority-badge priority-unknown">
                            ⚪ Not Calculated
                          </span>

                        )}

                      </div>

                      {report.priorityReason && (

                        <p className="priority-reason">
                          {report.priorityReason}
                        </p>

                      )}

                    </div>


                    {/* --------------------------------------------------
                        SENSITIVE LOCATION
                    -------------------------------------------------- */}

                    {report.sensitiveLocationType &&
                      report.sensitiveLocationType !==
                        "None" && (

                      <div className="sensitive-location-card">

                        <div className="sensitive-location-title">
                          <strong>
                            ⚠️ Nearby Important Location
                          </strong>
                        </div>

                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          {
                            report.sensitiveLocationType
                          }
                        </p>

                        {report.sensitiveLocationName && (

                          <p>
                            <strong>
                              Name:
                            </strong>{" "}
                            {
                              report.sensitiveLocationName
                            }
                          </p>

                        )}

                        {report.sensitiveLocationDistance && (

                          <p>
                            <strong>
                              Approximate Distance:
                            </strong>{" "}
                            {
                              report.sensitiveLocationDistance
                            }{" "}
                            metres
                          </p>

                        )}

                        <small>
                          User-reported location context
                        </small>

                      </div>

                    )}


                    {/* DESCRIPTION */}

                    <p className="report-description">
                      {
                        report.description
                      }
                    </p>


                    {/* LOCATION */}

                    <div className="report-location">

                      <strong>
                        📍 Location
                      </strong>

                      <p>
                        Latitude:{" "}
                        {
                          report.latitude
                        }
                      </p>

                      <p>
                        Longitude:{" "}
                        {
                          report.longitude
                        }
                      </p>

                    </div>


                    {/* DATE */}

                    <p className="report-date">

                      📅 Submitted:{" "}

                      {new Date(
                        report.createdAt
                      ).toLocaleString()}

                    </p>


                    {/* --------------------------------------------------
                        COLLECTED REPORT
                    -------------------------------------------------- */}

                    {report.status ===
                      "Collected" && (

                      <div className="citizen-proof">

                        <div className="citizen-proof-header">

                          <strong>
                            ✅ Garbage Collected
                          </strong>

                          <span>
                            Collection proof uploaded by collector
                          </span>

                        </div>

                        {report.proofImage && (

                          <img
                            src={
                              report.proofImage
                            }
                            alt="Collector collection proof"
                          />

                        )}

                      </div>

                    )}


                    {/* --------------------------------------------------
                        RATING
                    -------------------------------------------------- */}

                    {report.status ===
                      "Collected" && (

                      <div className="rating-section">

                        <h3>
                          ⭐ Rate Collector
                        </h3>

                        {report.rating ? (

                          <div className="rating-submitted">

                            <strong>
                              Your Rating:{" "}
                              {
                                report.rating
                              }
                              /5 ⭐
                            </strong>

                            {report.feedback && (

                              <p>
                                Your Feedback:{" "}

                                {
                                  report.feedback
                                }
                              </p>

                            )}

                          </div>

                        ) : (

                          <>

                            {/* STARS */}

                            <div className="rating-stars">

                              {[1, 2, 3, 4, 5].map(
                                (star) => (

                                  <button
                                    key={
                                      star
                                    }
                                    type="button"
                                    onClick={() =>
                                      setRatings(
                                        (
                                          previousRatings
                                        ) => ({
                                          ...previousRatings,

                                          [report.id]:
                                            star,
                                        })
                                      )
                                    }
                                    className={
                                      ratings[
                                        report.id
                                      ] >=
                                      star
                                        ? "star active"
                                        : "star"
                                    }
                                  >
                                    ★
                                  </button>

                                )
                              )}

                            </div>

                            {/* FEEDBACK */}

                            <textarea
                              placeholder="Write optional feedback..."
                              value={
                                feedback[
                                  report.id
                                ] || ""
                              }
                              onChange={(
                                event
                              ) =>
                                setFeedback(
                                  (
                                    previousFeedback
                                  ) => ({
                                    ...previousFeedback,

                                    [report.id]:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              rows="3"
                            ></textarea>

                            {/* SUBMIT */}

                            <button
                              type="button"
                              className="submit-rating-button"
                              onClick={() =>
                                handleRating(
                                  report.id
                                )
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

              )
            )}

          </div>

        ) : (

          <div className="empty-reports">

            <div className="empty-icon">
              🗑️
            </div>

            <h3>
              No reports yet
            </h3>

            <p>
              You haven't submitted any garbage reports yet.
              Report garbage in your area to help keep your
              community clean.
            </p>

            <a
              href="/report"
              className="empty-report-btn"
            >
              Report Garbage
            </a>

          </div>

        )}

      </div>

    </div>
  );
}

export default CitizenDashboard;