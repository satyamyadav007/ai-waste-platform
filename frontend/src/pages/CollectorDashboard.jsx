import { useState } from "react";
import ReportMap from "../components/ReportMap";

function CollectorDashboard() {
  const [reports, setReports] = useState(() => {
    return JSON.parse(localStorage.getItem("garbageReports")) || [];
  });

  const [proofImages, setProofImages] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [verificationResults, setVerificationResults] = useState({});
  const [verificationLoading, setVerificationLoading] = useState({});

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

    setProofFiles((previousFiles) => ({
      ...previousFiles,
      [reportId]: file,
    }));

    setVerificationResults((previousResults) => ({
      ...previousResults,
      [reportId]: null,
    }));
  }

  function dataUrlToBase64(dataUrl) {
    const parts = dataUrl.split(",");

    return {
      data: parts[1],
      mimeType: dataUrl
        .split(";")[0]
        .split(":")[1],
    };
  }

  async function verifyCollection(reportId) {
    const report = reports.find(
      (item) => item.id === reportId
    );

    const proofFile = proofFiles[reportId];

    if (!report) {
      alert("Report not found.");
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

    setVerificationLoading((previous) => ({
      ...previous,
      [reportId]: true,
    }));

    try {
      const beforeImage = dataUrlToBase64(
        report.originalImageData
      );

      const afterImage = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            const dataUrl = reader.result;

            resolve(
              dataUrlToBase64(dataUrl)
            );
          };

          reader.onerror = reject;

          reader.readAsDataURL(proofFile);
        }
      );

      console.log(
        "Sending before and after images for AI verification."
      );

      const response = await fetch(
        "http://localhost:5000/api/verify-collection",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            beforeImage: beforeImage.data,
            beforeMimeType: beforeImage.mimeType,

            afterImage: afterImage.data,
            afterMimeType: afterImage.mimeType,
          }),
        }
      );

      const data = await response.json();

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
          [reportId]: data,
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
          [reportId]: false,
        })
      );
    }
  }

  function handleCollected(reportId) {
    const proofImage = proofImages[reportId];

    if (!proofImage) {
      alert(
        "Please upload a collection proof image first."
      );
      return;
    }

    const verification =
      verificationResults[reportId];

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

    const updatedReports = reports.map(
      (report) => {
        if (report.id === reportId) {
          return {
            ...report,
            status: "Collected",
            proofImage: proofImage,
            verification: verification,
          };
        }

        return report;
      }
    );

    localStorage.setItem(
      "garbageReports",
      JSON.stringify(updatedReports)
    );

    setReports(updatedReports);

    alert(
      "Garbage verified and marked as collected!"
    );
  }

  function getPriorityText(severity) {
    if (severity === "High") {
      return "High Priority";
    }

    if (severity === "Medium") {
      return "Medium Priority";
    }

    if (severity === "Low") {
      return "Low Priority";
    }

    return "Priority Not Available";
  }

  function getPriorityValue(report) {
    if (!report.aiResult) {
      return 0;
    }

    if (report.aiResult.severity === "High") {
      return 3;
    }

    if (report.aiResult.severity === "Medium") {
      return 2;
    }

    if (report.aiResult.severity === "Low") {
      return 1;
    }

    return 0;
  }

  const sortedReports = [...reports].sort(
    (a, b) => {
      return (
        getPriorityValue(b) -
        getPriorityValue(a)
      );
    }
  );

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
              and their AI-based priority.
            </p>
          </div>
        </div>

        <ReportMap />
      </div>


      {/* REPORTS */}

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
              Reports are automatically arranged
              by AI priority.
            </p>
          </div>
        </div>

        {sortedReports.length > 0 ? (

          <div className="reports-list">

            {sortedReports.map(
              (report) => (

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
                            {getPriorityText(
                              report.aiResult.severity
                            )}
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
                            AI Garbage Type:
                          </strong>{" "}
                          {
                            report.aiResult
                              .garbageType
                          }
                        </p>


                        <p>
                          <strong>
                            Confidence:
                          </strong>{" "}
                          {
                            report.aiResult
                              .confidence
                          }%
                        </p>


                        <p>
                          <strong>
                            Severity:
                          </strong>{" "}
                          {
                            report.aiResult
                              .severity
                          }
                        </p>


                        <p>
                          <strong>
                            AI Description:
                          </strong>{" "}
                          {
                            report.aiResult
                              .description
                          }
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

                              {verificationResults[
                                report.id
                              ].garbageRemoved
                                ? "Yes ✅"
                                : "No ❌"}

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


                    {report.status === "Collected" &&
                      report.proofImage && (

                        <div className="proof-preview">

                          <strong>
                            Collection Proof
                          </strong>

                          <img
                            src={
                              report.proofImage
                            }
                            alt="Collection proof"
                          />

                        </div>

                    )}


                    {report.status === "Collected" &&
                      report.verification && (

                        <div className="verification-box">

                          <h3>
                            🤖 AI Verification
                          </h3>


                          <p>
                            <strong>
                              Garbage Removed:
                            </strong>{" "}

                            {report.verification
                              .garbageRemoved
                              ? "Yes ✅"
                              : "No ❌"}

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

            ))}

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