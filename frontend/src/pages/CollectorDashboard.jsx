import { useEffect, useState } from "react";
import ReportMap from "../components/ReportMap";

function CollectorDashboard({
  view = "dashboard",
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [proofImages, setProofImages] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [verificationResults, setVerificationResults] =
    useState({});
  const [verificationLoading, setVerificationLoading] =
    useState({});

  // --------------------------------------------------
  // FETCH REPORTS
  // --------------------------------------------------

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://ai-waste-platform.onrender.com/api/reports"
        );

        const data = await response.json();

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

      } catch (error) {
        console.error(
          "Collector reports fetch error:",
          error
        );

        setError(
          "Unable to load reports from MongoDB."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // --------------------------------------------------
  // FILE TO DATA URL
  // --------------------------------------------------

  function fileToDataUrl(file) {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onloadend = () => {
          resolve(
            reader.result
          );
        };

        reader.onerror =
          reject;

        reader.readAsDataURL(file);
      }
    );
  }

  // --------------------------------------------------
  // PROOF IMAGE
  // --------------------------------------------------

  async function handleProofImageChange(
    event,
    reportId
  ) {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      setProofImages(
        (previousImages) => ({
          ...previousImages,

          [reportId]:
            dataUrl,
        })
      );

      setProofFiles(
        (previousFiles) => ({
          ...previousFiles,

          [reportId]:
            file,
        })
      );

      setVerificationResults(
        (previousResults) => ({
          ...previousResults,

          [reportId]:
            null,
        })
      );

    } catch (error) {
      console.error(
        "Proof image processing error:",
        error
      );

      alert(
        "Unable to process the collection proof image."
      );
    }
  }

  // --------------------------------------------------
  // DATA URL TO BASE64
  // --------------------------------------------------

  function dataUrlToBase64(
    dataUrl
  ) {
    const parts =
      dataUrl.split(",");

    return {
      data:
        parts[1],

      mimeType:
        dataUrl
          .split(";")[0]
          .split(":")[1],
    };
  }

  // --------------------------------------------------
  // AI COLLECTION VERIFICATION
  // --------------------------------------------------

  async function verifyCollection(
    reportId
  ) {
    const report =
      reports.find(
        (item) =>
          item.id === reportId
      );

    const proofFile =
      proofFiles[reportId];

    if (!report) {
      alert(
        "Report not found."
      );

      return;
    }

    if (!report.originalImageData) {
      alert(
        "This report was created before image storage was added. Please create a new report for AI verification."
      );

      return;
    }

    if (!proofFile) {
      alert(
        "Please upload a collection proof image first."
      );

      return;
    }

    setVerificationLoading(
      (previous) => ({
        ...previous,

        [reportId]:
          true,
      })
    );

    try {
      const beforeImage =
        dataUrlToBase64(
          report.originalImageData
        );

      const afterImage =
        await new Promise(
          (resolve, reject) => {
            const reader =
              new FileReader();

            reader.onloadend =
              () => {
                const dataUrl =
                  reader.result;

                resolve(
                  dataUrlToBase64(
                    dataUrl
                  )
                );
              };

            reader.onerror =
              reject;

            reader.readAsDataURL(
              proofFile
            );
          }
        );

      const response =
        await fetch(
          "https://ai-waste-platform.onrender.com/api/verify-collection",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                beforeImage:
                  beforeImage.data,

                beforeMimeType:
                  beforeImage.mimeType,

                afterImage:
                  afterImage.data,

                afterMimeType:
                  afterImage.mimeType,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "AI verification failed."
        );

        return;
      }

      setVerificationResults(
        (previousResults) => ({
          ...previousResults,

          [reportId]:
            data,
        })
      );

    } catch (error) {
      console.error(
        "Verification Error:",
        error
      );

      alert(
        "Unable to connect to the AI verification service."
      );

    } finally {
      setVerificationLoading(
        (previous) => ({
          ...previous,

          [reportId]:
            false,
        })
      );
    }
  }

  // --------------------------------------------------
  // MARK AS COLLECTED
  // --------------------------------------------------

  async function handleCollected(
    reportId
  ) {
    const proofImage =
      proofImages[reportId];

    if (!proofImage) {
      alert(
        "Please upload a collection proof image first."
      );

      return;
    }

    const verification =
      verificationResults[
        reportId
      ];

    if (!verification) {
      alert(
        "Please run AI verification before marking the garbage as collected."
      );

      return;
    }

    if (!verification.garbageRemoved) {
      alert(
        "AI verification could not confirm that the garbage was removed."
      );

      return;
    }

    try {
      const response =
        await fetch(
          `https://ai-waste-platform.onrender.com/api/reports/${reportId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status:
                  "Collected",

                proofImage:
                  proofImage,

                verification:
                  verification,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update report."
        );

        return;
      }

      setReports(
        (previousReports) =>
          previousReports.map(
            (report) =>
              report.id === reportId
                ? {
                    ...report,
                    status:
                      "Collected",
                    proofImage:
                      proofImage,
                    verification:
                      verification,
                  }
                : report
          )
      );

      alert(
        "Garbage verified and marked as collected!"
      );

    } catch (error) {
      console.error(
        "Collection update error:",
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  }

  // --------------------------------------------------
  // REPLACE COLLECTION PROOF
  // --------------------------------------------------

  async function handleReplaceProof(
    event,
    report
  ) {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      if (!report.verification) {
        alert(
          "Existing verification data was not found."
        );

        return;
      }

      const response =
        await fetch(
          `https://ai-waste-platform.onrender.com/api/reports/${report.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status:
                  "Collected",

                proofImage:
                  dataUrl,

                verification:
                  report.verification,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to replace collection proof."
        );

        return;
      }

      setReports(
        (previousReports) =>
          previousReports.map(
            (item) =>
              item.id === report.id
                ? {
                    ...item,
                    proofImage:
                      dataUrl,
                  }
                : item
          )
      );

      alert(
        "Collection proof replaced successfully!"
      );

    } catch (error) {
      console.error(
        "Proof replacement error:",
        error
      );

      alert(
        "Unable to update the collection proof."
      );
    }
  }

  // --------------------------------------------------
  // PRIORITY VALUE
  // --------------------------------------------------

  function getPriorityValue(
    priority
  ) {
    if (
      priority === "High"
    ) {
      return 3;
    }

    if (
      priority === "Medium"
    ) {
      return 2;
    }

    if (
      priority === "Low"
    ) {
      return 1;
    }

    return 0;
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
  // REPORT GROUPS
  // --------------------------------------------------

  const pendingReports =
    reports
      .filter(
        (report) =>
          report.status === "Pending"
      )
      .sort(
        (a, b) => {
          const priorityDifference =
            getPriorityValue(
              b.priority
            ) -
            getPriorityValue(
              a.priority
            );

          if (
            priorityDifference !== 0
          ) {
            return priorityDifference;
          }

          return (
            new Date(
              a.createdAt
            ) -
            new Date(
              b.createdAt
            )
          );
        }
      );

  const collectedReports =
    reports
      .filter(
        (report) =>
          report.status ===
            "Collected" ||
          report.status ===
            "Resolved"
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      );

  const highPriorityCount =
    pendingReports.filter(
      (report) =>
        report.priority ===
        "High"
    ).length;

  const mediumPriorityCount =
    pendingReports.filter(
      (report) =>
        report.priority ===
        "Medium"
    ).length;

  const lowPriorityCount =
    pendingReports.filter(
      (report) =>
        report.priority ===
        "Low"
    ).length;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>
            <p className="dashboard-tag">
              COLLECTOR PORTAL
            </p>

            <h1>
              {view === "pending"
                ? "Pending Reports"
                : view === "collected"
                ? "Collection History"
                : "Collector Dashboard"}
            </h1>

            <p>
              Loading reports from MongoDB...
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
            Please wait while reports
            are being loaded.
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>
            <p className="dashboard-tag">
              COLLECTOR PORTAL
            </p>

            <h1>
              Collector Dashboard
            </h1>

            <p>
              View and manage garbage
              collection reports.
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

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD OVERVIEW
  // --------------------------------------------------

  if (
    view === "dashboard"
  ) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>

            <p className="dashboard-tag">
              COLLECTOR PORTAL
            </p>

            <h1>
              Collector Dashboard
            </h1>

            <p>
              Manage waste collection and
              prioritize reports that need action.
            </p>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="collector-overview-stats">

          <div className="stat-card">

            <span className="stat-icon">
              🚛
            </span>

            <div>
              <p>
                Pending Reports
              </p>

              <h2>
                {pendingReports.length}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              🔴
            </span>

            <div>
              <p>
                High Priority
              </p>

              <h2>
                {highPriorityCount}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>
              <p>
                Collected
              </p>

              <h2>
                {collectedReports.length}
              </h2>
            </div>

          </div>

        </div>


        {/* PRIORITY SUMMARY */}

        <div className="collector-priority-summary">

          <div>

            <span className="priority-summary-dot high">
              🔴
            </span>

            <div>
              <strong>
                {highPriorityCount}
              </strong>

              <small>
                High Priority
              </small>
            </div>

          </div>


          <div>

            <span className="priority-summary-dot medium">
              🟠
            </span>

            <div>
              <strong>
                {mediumPriorityCount}
              </strong>

              <small>
                Medium Priority
              </small>
            </div>

          </div>


          <div>

            <span className="priority-summary-dot low">
              🟢
            </span>

            <div>
              <strong>
                {lowPriorityCount}
              </strong>

              <small>
                Low Priority
              </small>
            </div>

          </div>

        </div>


        {/* MAP */}

        <div className="reports-section">

          <div className="section-title">

            <div>

              <p className="dashboard-tag">
                REPORT LOCATIONS
              </p>

              <h2>
                Garbage Locations Map
              </h2>

              <p>
                View reported garbage locations
                and their priority.
              </p>

            </div>

          </div>

          <ReportMap />

        </div>


        {/* QUICK ACTION */}

        <div className="collector-quick-actions">

          <a
            href="/collector-pending"
            className="collector-quick-action pending"
          >
            <span>
              🚛
            </span>

            <div>

              <strong>
                Pending Reports
              </strong>

              <small>
                View and collect pending garbage
              </small>

            </div>

            <b>
              →
            </b>

          </a>


          <a
            href="/collector-collected"
            className="collector-quick-action collected"
          >
            <span>
              ✅
            </span>

            <div>

              <strong>
                Collection History
              </strong>

              <small>
                View previously collected reports
              </small>

            </div>

            <b>
              →
            </b>

          </a>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // REPORT PAGE
  // --------------------------------------------------

  const reportsToDisplay =
    view === "pending"
      ? pendingReports
      : collectedReports;

  const isPendingView =
    view === "pending";

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>

          <p className="dashboard-tag">
            {isPendingView
              ? "ACTIVE COLLECTION"
              : "COLLECTION HISTORY"}
          </p>

          <h1>
            {isPendingView
              ? "Pending Reports"
              : "Collection History"}
          </h1>

          <p>
            {isPendingView
              ? "Reports waiting for collection, arranged by context-aware priority."
              : "Previously collected reports with collection proof and AI verification."}
          </p>

        </div>

      </div>


      {/* PAGE SUMMARY */}

      <div className="collector-page-summary">

        <div>
          <span>
            {isPendingView
              ? "🚛"
              : "✅"}
          </span>

          <div>
            <strong>
              {reportsToDisplay.length}
            </strong>

            <small>
              {isPendingView
                ? "Pending Reports"
                : "Collected Reports"}
            </small>
          </div>
        </div>

        {isPendingView && (

          <>

            <div>
              <span>
                🔴
              </span>

              <div>
                <strong>
                  {highPriorityCount}
                </strong>

                <small>
                  High Priority
                </small>
              </div>
            </div>


            <div>
              <span>
                🟠
              </span>

              <div>
                <strong>
                  {mediumPriorityCount}
                </strong>

                <small>
                  Medium Priority
                </small>
              </div>
            </div>

          </>

        )}

      </div>


      {/* REPORTS */}

      <div className="reports-section">

        {reportsToDisplay.length > 0 ? (

          <div className="reports-list">

            {reportsToDisplay.map(
              (report) => (

                <div
                  className="report-card"
                  key={report.id}
                >

                  <div className="report-card-image">

                    <img
                      src={
                        report.originalImageData ||
                        report.image
                      }
                      alt="Reported garbage"
                    />

                  </div>


                  <div className="report-card-content">

                    {/* HEADER */}

                    <div className="report-card-header">

                      <div>

                        <p className="report-id">
                          Report #{report.id}
                        </p>

                        <h3>
                          {
                            report.garbageType
                          }
                        </h3>

                      </div>

                      <span className="report-status">
                        {
                          report.status
                        }
                      </span>

                    </div>


                    {/* PRIORITY */}

                    <div className="collector-priority-box">

                      <div className="collector-priority-header">

                        <strong>
                          Context-Aware Priority
                        </strong>

                        <span
                          className={`priority-badge ${getPriorityClass(
                            report.priority
                          )}`}
                        >
                          {getPriorityIcon(
                            report.priority
                          )}{" "}
                          {report.priority ||
                            "Not Calculated"}
                        </span>

                      </div>

                      {report.priorityReason && (

                        <p className="priority-reason">
                          {
                            report.priorityReason
                          }
                        </p>

                      )}

                    </div>


                    {/* SENSITIVE LOCATION */}

                    {report.sensitiveLocationType &&
                      report.sensitiveLocationType !==
                        "None" && (

                      <div className="collector-sensitive-location">

                        <div className="collector-sensitive-title">

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


                    {/* AI ANALYSIS */}

                    {report.aiResult && (

                      <div className="collector-ai-box">

                        <div className="collector-ai-header">

                          <h3>
                            🤖 AI Analysis
                          </h3>

                          <span className="ai-priority">
                            {
                              report
                                .aiResult
                                .severity
                            } Severity
                          </span>

                        </div>

                        <p>
                          <strong>
                            Garbage Detected:
                          </strong>{" "}

                          {
                            report
                              .aiResult
                              .garbageDetected
                              ? "Yes"
                              : "No"
                          }
                        </p>

                        <p>
                          <strong>
                            AI Garbage Type:
                          </strong>{" "}

                          {
                            report
                              .aiResult
                              .garbageType
                          }
                        </p>

                        <p>
                          <strong>
                            Confidence:
                          </strong>{" "}

                          {
                            report
                              .aiResult
                              .confidence
                          }%
                        </p>

                        <p>
                          <strong>
                            Severity:
                          </strong>{" "}

                          {
                            report
                              .aiResult
                              .severity
                          }
                        </p>

                      </div>

                    )}


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


                    {/* PENDING ACTIONS */}

                    {isPendingView && (

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


                        {proofImages[
                          report.id
                        ] && (

                          <div className="proof-preview">

                            <img
                              src={
                                proofImages[
                                  report.id
                                ]
                              }
                              alt="Collection proof"
                            />

                          </div>

                        )}


                        <button
                          type="button"
                          className="ai-analyze-button"
                          onClick={() =>
                            verifyCollection(
                              report.id
                            )
                          }
                          disabled={
                            verificationLoading[
                              report.id
                            ]
                          }
                        >

                          {verificationLoading[
                            report.id
                          ]
                            ? "🤖 Verifying..."
                            : "🤖 Verify Collection with AI"}

                        </button>


                        {verificationResults[
                          report.id
                        ] && (

                          <div className="verification-box">

                            <h3>
                              🤖 AI Collection Verification
                            </h3>

                            <p>
                              <strong>
                                Garbage Removed:
                              </strong>{" "}

                              {
                                verificationResults[
                                  report.id
                                ].garbageRemoved
                                  ? "Yes ✅"
                                  : "No ❌"
                              }
                            </p>

                            <p>
                              <strong>
                                Confidence:
                              </strong>{" "}

                              {
                                verificationResults[
                                  report.id
                                ].confidence
                              }%
                            </p>

                            <p>
                              <strong>
                                Explanation:
                              </strong>{" "}

                              {
                                verificationResults[
                                  report.id
                                ].explanation
                              }
                            </p>

                          </div>

                        )}


                        <button
                          type="button"
                          className="collect-button"
                          onClick={() =>
                            handleCollected(
                              report.id
                            )
                          }
                        >
                          ✅ Mark as Collected
                        </button>

                      </div>

                    )}


                    {/* COLLECTED PROOF */}

                    {!isPendingView && (

                      <>

                        <div className="proof-preview">

                          <strong>
                            ✅ Collection Proof
                          </strong>

                          {report.proofImage ? (

                            <img
                              src={
                                report.proofImage
                              }
                              alt="Collection proof"
                            />

                          ) : (

                            <p>
                              No collection proof
                              is currently stored.
                            </p>

                          )}

                          <label className="proof-upload">

                            📷 Replace Collection Proof

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                handleReplaceProof(
                                  event,
                                  report
                                )
                              }
                              hidden
                            />

                          </label>

                        </div>


                        {report.verification && (

                          <div className="verification-box">

                            <h3>
                              🤖 AI Verification
                            </h3>

                            <p>

                              <strong>
                                Garbage Removed:
                              </strong>{" "}

                              {
                                report.verification
                                  .garbageRemoved
                                  ? "Yes ✅"
                                  : "No ❌"
                              }

                            </p>

                            <p>

                              <strong>
                                Confidence:
                              </strong>{" "}

                              {
                                report.verification
                                  .confidence
                              }%

                            </p>

                            <p>

                              <strong>
                                Explanation:
                              </strong>{" "}

                              {
                                report.verification
                                  .explanation
                              }

                            </p>

                          </div>

                        )}

                      </>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="empty-reports">

            <div className="empty-icon">

              {isPendingView
                ? "🎉"
                : "📦"}

            </div>

            <h3>

              {isPendingView
                ? "No Pending Reports"
                : "No Collection History"}

            </h3>

            <p>

              {isPendingView
                ? "Great! There are currently no garbage reports waiting for collection."
                : "No reports have been marked as collected yet."}

            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default CollectorDashboard;