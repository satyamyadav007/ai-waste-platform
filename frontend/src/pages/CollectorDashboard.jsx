import { useEffect, useState } from "react";
import ReportMap from "../components/ReportMap";

function CollectorDashboard() {
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

        console.log(
          "Collector reports loaded from MongoDB:",
          normalizedReports.length
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

      console.log(
        "Collection proof prepared as persistent Data URL."
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

      console.log(
        "Sending before and after images for AI verification."
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

      console.log(
        "Verification result:",
        data
      );

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
      console.log(
        "Updating garbage report in MongoDB..."
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

      console.log(
        "MongoDB update response:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update report."
        );

        return;
      }

      const updatedReports =
        reports.map(
          (report) => {

            if (
              report.id ===
              reportId
            ) {

              return {
                ...report,

                status:
                  "Collected",

                proofImage:
                  proofImage,

                verification:
                  verification,
              };
            }

            return report;
          }
        );

      setReports(
        updatedReports
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
  // REPLACE EXISTING COLLECTION PROOF
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

      console.log(
        "Replacing collection proof in MongoDB..."
      );

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

      console.log(
        "Proof replacement response:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to replace collection proof."
        );

        return;
      }

      const updatedReports =
        reports.map(
          (item) => {

            if (
              item.id ===
              report.id
            ) {

              return {
                ...item,

                proofImage:
                  dataUrl,
              };
            }

            return item;
          }
        );

      setReports(
        updatedReports
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
  // PRIORITY TEXT
  // --------------------------------------------------

  function getPriorityText(
    priority
  ) {
    if (
      priority === "High"
    ) {
      return "High Priority";
    }

    if (
      priority === "Medium"
    ) {
      return "Medium Priority";
    }

    if (
      priority === "Low"
    ) {
      return "Low Priority";
    }

    return "Priority Not Available";
  }

  // --------------------------------------------------
  // SORT REPORTS
  // --------------------------------------------------

  const sortedReports =
    [...reports].sort(
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

  // --------------------------------------------------
  // LOADING STATE
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
              Collector Dashboard
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
  // ERROR STATE
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
              View garbage reports submitted by
              citizens and manage collection
              activities.
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
            COLLECTOR PORTAL
          </p>

          <h1>
            Collector Dashboard
          </h1>

          <p>
            View garbage reports submitted by
            citizens and manage collection
            activities.
          </p>

        </div>

      </div>

      {/* --------------------------------------------------
          MAP
      -------------------------------------------------- */}

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
              and their AI-based priority.
            </p>

          </div>

        </div>

        <ReportMap />

      </div>

      {/* --------------------------------------------------
          REPORTS
      -------------------------------------------------- */}

      <div className="reports-section">

        <div className="section-title">

          <div>

            <p className="dashboard-tag">
              GARBAGE REPORTS
            </p>

            <h2>
              Reports to Collect
            </h2>

            <p>
              Reports are arranged by
              context-aware priority.
            </p>

          </div>

        </div>

        {sortedReports.length > 0 ? (

          <div className="reports-list">

            {sortedReports.map(
              (report) => (

                <div
                  className="report-card"
                  key={
                    report.id
                  }
                >

                  {/* REPORT IMAGE */}

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


                    {/* --------------------------------------------------
                        CONTEXT-AWARE PRIORITY
                    -------------------------------------------------- */}

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
                          {getPriorityText(
                            report.priority
                          )}
                        </span>

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
                                ? `${report.aiResult.severity} Severity`
                                : "Severity unavailable"
                            }
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

                        <p>
                          <strong>
                            AI Description:
                          </strong>{" "}

                          {
                            report
                              .aiResult
                              .description
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


                    {/* --------------------------------------------------
                        PENDING REPORT ACTIONS
                    -------------------------------------------------- */}

                    {report.status ===
                      "Pending" && (

                      <div className="collector-action">

                        {/* PROOF UPLOAD */}

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


                        {/* PROOF PREVIEW */}

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


                        {/* AI VERIFICATION */}

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


                        {/* VERIFICATION RESULT */}

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
                              }%{" "}

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


                        {/* MARK COLLECTED */}

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


                    {/* --------------------------------------------------
                        COLLECTED REPORT PROOF
                    -------------------------------------------------- */}

                    {report.status ===
                      "Collected" && (

                      <div className="proof-preview">

                        <strong>
                          Collection Proof
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


                        {/* REPLACE PROOF */}

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

                    )}


                    {/* --------------------------------------------------
                        COLLECTED REPORT VERIFICATION
                    -------------------------------------------------- */}

                    {report.status ===
                      "Collected" &&
                      report.verification && (

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
              No garbage reports
            </h3>

            <p>
              There are currently no garbage
              reports submitted by citizens.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default CollectorDashboard;