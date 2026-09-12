import { useState } from "react";

function ReportGarbage() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [originalImageData, setOriginalImageData] =
    useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [garbageType, setGarbageType] = useState("");
  const [description, setDescription] = useState("");

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [duplicateResult, setDuplicateResult] =
    useState(null);
  const [duplicateLoading, setDuplicateLoading] =
    useState(false);


  // --------------------------------------------------
  // COMPRESS IMAGE
  // --------------------------------------------------

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const maxWidth = 1280;
          const maxHeight = 1280;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height =
              (height * maxWidth) / width;

            width = maxWidth;
          }

          if (height > maxHeight) {
            width =
              (width * maxHeight) / height;

            height = maxHeight;
          }

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressedImage =
            canvas.toDataURL(
              "image/jpeg",
              0.75
            );

          resolve(compressedImage);
        };

        img.onerror = reject;

        img.src =
          event.target.result;
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }


  // --------------------------------------------------
  // IMAGE CHANGE
  // --------------------------------------------------

  async function handleImageChange(event) {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    try {
      setImageFile(file);

      setImage(
        URL.createObjectURL(file)
      );

      const compressedImage =
        await compressImage(file);

      setOriginalImageData(
        compressedImage
      );

      setAiResult(null);
      setDuplicateResult(null);
      setGarbageType("");
      setDescription("");

      console.log(
        "Compressed image ready for storage and AI."
      );

    } catch (error) {
      console.error(
        "Image processing error:",
        error
      );

      alert(
        "Unable to process the selected image."
      );
    }
  }


  // --------------------------------------------------
  // AI GARBAGE ANALYSIS
  // --------------------------------------------------

  async function analyzeWithAI() {
    if (!imageFile) {
      alert(
        "Please upload a garbage image first."
      );

      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const imageData =
        originalImageData;

      if (!imageData) {
        alert(
          "Image is still being processed. Please try again."
        );

        setAiLoading(false);

        return;
      }

      const parts =
        imageData.split(",");

      const base64Image =
        parts[1];

      const response =
        await fetch(
          "http://localhost:5000/api/analyze-garbage",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              image:
                base64Image,

              mimeType:
                "image/jpeg",
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "AI result received:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "AI analysis failed."
        );

        setAiLoading(false);

        return;
      }

      setAiResult(data);

      if (
        data.garbageDetected
      ) {
        setGarbageType(
          data.garbageType
        );
      }

      setDescription(
        data.description || ""
      );

      setAiLoading(false);

    } catch (error) {
      console.error(
        "Frontend AI Error:",
        error
      );

      alert(
        "Unable to connect to the AI backend."
      );

      setAiLoading(false);
    }
  }


  // --------------------------------------------------
  // CALCULATE DISTANCE
  // --------------------------------------------------

  function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
  ) {
    const earthRadius =
      6371000;

    const lat1Radians =
      (lat1 * Math.PI) / 180;

    const lat2Radians =
      (lat2 * Math.PI) / 180;

    const latDifference =
      ((lat2 - lat1) * Math.PI) /
      180;

    const lonDifference =
      ((lon2 - lon1) * Math.PI) /
      180;

    const a =
      Math.sin(
        latDifference / 2
      ) *
        Math.sin(
          latDifference / 2
        ) +
      Math.cos(lat1Radians) *
        Math.cos(lat2Radians) *
        Math.sin(
          lonDifference / 2
        ) *
        Math.sin(
          lonDifference / 2
        );

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return (
      earthRadius * c
    );
  }


  // --------------------------------------------------
  // GET BASE64 PARTS
  // --------------------------------------------------

  function getBase64Parts(
    dataUrl
  ) {
    if (
      !dataUrl ||
      typeof dataUrl !==
        "string"
    ) {
      return null;
    }

    const parts =
      dataUrl.split(",");

    if (
      parts.length < 2
    ) {
      return null;
    }

    return {
      data: parts[1],

      mimeType:
        parts[0]
          .split(":")[1]
          .split(";")[0],
    };
  }


  // --------------------------------------------------
  // CHECK DUPLICATE
  // --------------------------------------------------

  async function checkForDuplicate() {
    console.log(
      "Starting duplicate complaint check..."
    );

    if (!originalImageData) {
      alert(
        "Please upload an image first."
      );

      return;
    }

    if (!location) {
      alert(
        "Please detect your location before checking duplicates."
      );

      return;
    }

    setDuplicateLoading(true);
    setDuplicateResult(null);

    try {
      const allReports =
        JSON.parse(
          localStorage.getItem(
            "garbageReports"
          )
        ) || [];

      console.log(
        "Total stored reports:",
        allReports.length
      );

      const nearbyReports =
        allReports
          .map((report) => {
            if (
              report.latitude ===
                undefined ||
              report.longitude ===
                undefined
            ) {
              return null;
            }

            const distance =
              calculateDistance(
                location.latitude,
                location.longitude,
                Number(
                  report.latitude
                ),
                Number(
                  report.longitude
                )
              );

            return {
              ...report,

              distanceMeters:
                Math.round(
                  distance
                ),
            };
          })
          .filter(
            (report) => {
              return (
                report !== null &&
                report.distanceMeters <=
                  100 &&
                report.originalImageData
              );
            }
          )
          .sort(
            (a, b) =>
              a.distanceMeters -
              b.distanceMeters
          )
          .slice(0, 2);

      console.log(
        "Nearby usable reports:",
        nearbyReports.length
      );

      const currentImage =
        getBase64Parts(
          originalImageData
        );

      if (!currentImage) {
        alert(
          "Unable to process the selected image."
        );

        setDuplicateLoading(
          false
        );

        return;
      }

      if (
        nearbyReports.length === 0
      ) {
        setDuplicateResult({
          duplicateDetected:
            false,

          confidence:
            100,

          reason:
            "No nearby previous reports with usable images were found.",
        });

        setDuplicateLoading(
          false
        );

        return;
      }

      const existingReports =
        nearbyReports
          .map((report) => {
            const previousImage =
              getBase64Parts(
                report.originalImageData
              );

            if (!previousImage) {
              return null;
            }

            return {
              id:
                report.id,

              distanceMeters:
                report.distanceMeters,

              garbageType:
                report.garbageType,

              description:
                report.description,

              image:
                previousImage.data,

              mimeType:
                previousImage.mimeType,
            };
          })
          .filter(
            (report) =>
              report !== null
          );

      console.log(
        "Sending duplicate check request..."
      );

      const response =
        await fetch(
          "http://localhost:5000/api/check-duplicate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              currentImage:
                currentImage.data,

              currentMimeType:
                currentImage.mimeType,

              existingReports:
                existingReports,
            }),
          }
        );

      console.log(
        "Duplicate backend status:",
        response.status
      );

      const data =
        await response.json();

      console.log(
        "Duplicate result:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "Duplicate check failed."
        );

        setDuplicateLoading(
          false
        );

        return;
      }

      setDuplicateResult(
        data
      );

      setDuplicateLoading(
        false
      );

    } catch (error) {
      console.error(
        "Duplicate Check Error:",
        error
      );

      alert(
        "Unable to check for duplicate complaints."
      );

      setDuplicateLoading(
        false
      );
    }
  }


  // --------------------------------------------------
  // GET LOCATION
  // --------------------------------------------------

  function getLocation() {
    if (
      !navigator.geolocation
    ) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,
        });

        setLocationLoading(false);

        setDuplicateResult(
          null
        );
      },

      () => {
        alert(
          "Unable to get your location. Please allow location access."
        );

        setLocationLoading(false);
      }
    );
  }


  // --------------------------------------------------
  // SAVE REPORT
  // --------------------------------------------------

  async function saveReport() {
    const loggedInUser =
      JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        )
      );

    if (!loggedInUser) {
      alert(
        "Please login before submitting a report."
      );

      return;
    }

    const reportId =
      String(Date.now());

    const report = {
      reportId:
        reportId,

      userEmail:
        loggedInUser.email,

      image:
        image,

      originalImageData:
        originalImageData,

      garbageType:
        garbageType,

      description:
        description,

      latitude:
        location.latitude,

      longitude:
        location.longitude,

      status:
        "Pending",

      createdAt:
        new Date().toISOString(),

      aiResult:
        aiResult,

      duplicateCheck:
        duplicateResult,

      proofImage:
        "",

      verification: {
        garbageRemoved:
          false,

        confidence:
          0,

        explanation:
          "",
      },

      rating:
        null,

      feedback:
        "",
    };


    try {
      console.log(
        "Sending garbage report to MongoDB..."
      );

      const response =
        await fetch(
          "http://localhost:5000/api/reports",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                report
              ),
          }
        );


      const data =
        await response.json();


      console.log(
        "MongoDB report response:",
        data
      );


      if (!response.ok) {
        alert(
          data.message ||
            "Failed to save report."
        );

        return;
      }


      // --------------------------------------------------
      // KEEP LOCALSTORAGE FOR NOW
      // This keeps the existing dashboards working
      // during the MongoDB migration.
      // --------------------------------------------------

      const localReport = {
        id:
          reportId,

        image:
          image,

        originalImageData:
          originalImageData,

        garbageType:
          garbageType,

        description:
          description,

        latitude:
          location.latitude,

        longitude:
          location.longitude,

        status:
          "Pending",

        createdAt:
          new Date().toISOString(),

        userEmail:
          loggedInUser.email,

        aiResult:
          aiResult,

        duplicateCheck:
          duplicateResult,
      };


      const existingReports =
        JSON.parse(
          localStorage.getItem(
            "garbageReports"
          )
        ) || [];


      existingReports.push(
        localReport
      );


      localStorage.setItem(
        "garbageReports",
        JSON.stringify(
          existingReports
        )
      );


      console.log(
        "Garbage Report saved successfully:"
      );

      console.log(
        data.report
      );


      alert(
        "Garbage report submitted successfully!"
      );


      setImage(null);

      setImageFile(null);

      setOriginalImageData(
        null
      );

      setGarbageType("");

      setDescription("");

      setLocation(null);

      setAiResult(null);

      setDuplicateResult(
        null
      );

    } catch (error) {
      console.error(
        "Report submission error:",
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  }


  // --------------------------------------------------
  // HANDLE SUBMIT
  // --------------------------------------------------

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!image) {
      alert(
        "Please upload a garbage image."
      );

      return;
    }

    if (!garbageType) {
      alert(
        "Please select the garbage type."
      );

      return;
    }

    if (!description.trim()) {
      alert(
        "Please enter a description."
      );

      return;
    }

    if (!location) {
      alert(
        "Please detect your location."
      );

      return;
    }

    const loggedInUser =
      JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        )
      );

    if (!loggedInUser) {
      alert(
        "Please login before submitting a report."
      );

      return;
    }


    // --------------------------------------------------
    // DUPLICATE CONFIRMATION
    // --------------------------------------------------

    if (
      duplicateResult &&
      duplicateResult.duplicateDetected
    ) {
      const submitAnyway =
        window.confirm(
          `A possible duplicate complaint was detected.\n\n${duplicateResult.reason}\n\nDo you still want to submit this report?`
        );

      if (!submitAnyway) {
        return;
      }
    }


    await saveReport();
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="report-page">

      <div className="report-container">

        <div className="report-heading">

          <p className="section-tag">
            REPORT GARBAGE
          </p>

          <h1>
            Report a Garbage Problem
          </h1>

          <p>
            Help keep your neighbourhood clean
            by reporting garbage that needs
            attention.
          </p>

        </div>


        <div className="report-form">

          {/* IMAGE */}

          <div className="form-group">

            <label>
              Garbage Image
            </label>

            <label className="image-upload">

              {image ? (
                <img
                  src={image}
                  alt="Garbage preview"
                />
              ) : (
                <>
                  <span className="upload-icon">
                    📷
                  </span>

                  <strong>
                    Upload a garbage image
                  </strong>

                  <small>
                    Click here to select an image
                  </small>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                hidden
              />

            </label>

          </div>


          {/* AI ANALYSIS */}

          {image && (

            <div className="ai-analysis-box">

              <button
                type="button"
                className="ai-analyze-button"
                onClick={
                  analyzeWithAI
                }
                disabled={
                  aiLoading
                }
              >
                {aiLoading
                  ? "🤖 AI is analyzing..."
                  : "🤖 Analyze Image with AI"}
              </button>


              {aiResult && (

                <div className="ai-result">

                  <h3>
                    🤖 AI Analysis Result
                  </h3>


                  <p>

                    <strong>
                      Garbage Detected:
                    </strong>{" "}

                    {aiResult
                      .garbageDetected
                      ? "Yes"
                      : "No"}

                  </p>


                  <p>

                    <strong>
                      Garbage Type:
                    </strong>{" "}

                    {
                      aiResult
                        .garbageType
                    }

                  </p>


                  <p>

                    <strong>
                      Confidence:
                    </strong>{" "}

                    {
                      aiResult
                        .confidence
                    }%

                  </p>


                  <p>

                    <strong>
                      Severity:
                    </strong>{" "}

                    {
                      aiResult
                        .severity
                    }

                  </p>


                  <p>

                    <strong>
                      Description:
                    </strong>{" "}

                    {
                      aiResult
                        .description
                    }

                  </p>

                </div>

              )}

            </div>

          )}


          {/* GARBAGE TYPE */}

          <div className="form-group">

            <label htmlFor="garbage-type">
              Garbage Type
            </label>

            <select
              id="garbage-type"
              value={
                garbageType
              }
              onChange={(event) =>
                setGarbageType(
                  event.target.value
                )
              }
            >

              <option value="">
                Select garbage type
              </option>

              <option value="Household Waste">
                Household Waste
              </option>

              <option value="Plastic Waste">
                Plastic Waste
              </option>

              <option value="Construction Waste">
                Construction Waste
              </option>

              <option value="Organic Waste">
                Organic Waste
              </option>

              <option value="Mixed Waste">
                Mixed Waste
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              placeholder="Describe the garbage problem..."
              rows="5"
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            ></textarea>

          </div>


          {/* LOCATION */}

          <div className="form-group">

            <label>
              Location
            </label>

            <button
              type="button"
              className="location-button"
              onClick={
                getLocation
              }
            >
              {locationLoading
                ? "Getting your location..."
                : "📍 Use My Current Location"}
            </button>


            {location && (

              <div className="location-result">

                <strong>
                  📍 Location detected
                </strong>


                <p>
                  Latitude:{" "}

                  {
                    location.latitude
                  }

                </p>


                <p>
                  Longitude:{" "}

                  {
                    location.longitude
                  }

                </p>

              </div>

            )}


            <p className="location-note">
              Your location will help the
              waste collector find the garbage.
            </p>

          </div>


          {/* DUPLICATE CHECK */}

          {image && location && (

            <div className="duplicate-check-box">

              <h3>
                🔍 Duplicate Complaint Check
              </h3>

              <p>
                Check whether a similar garbage
                complaint already exists nearby.
              </p>


              <button
                type="button"
                className="ai-analyze-button"
                onClick={
                  checkForDuplicate
                }
                disabled={
                  duplicateLoading
                }
              >
                {duplicateLoading
                  ? "🤖 Checking..."
                  : "🔍 Check for Duplicate"}
              </button>


              {duplicateResult && (

                <div
                  className={
                    duplicateResult
                      .duplicateDetected
                      ? "duplicate-result duplicate-found"
                      : "duplicate-result duplicate-clear"
                  }
                >

                  <h3>
                    {
                      duplicateResult
                        .duplicateDetected
                        ? "⚠️ Possible Duplicate Found"
                        : "✅ No Duplicate Detected"
                    }
                  </h3>


                  <p>

                    <strong>
                      Confidence:
                    </strong>{" "}

                    {
                      duplicateResult
                        .confidence
                    }%

                  </p>


                  <p>

                    <strong>
                      AI Explanation:
                    </strong>{" "}

                    {
                      duplicateResult
                        .reason
                    }

                  </p>

                </div>

              )}

            </div>

          )}


          {/* SUBMIT */}

          <button
            type="button"
            className="submit-report"
            onClick={
              handleSubmit
            }
          >
            Submit Report
          </button>

        </div>

      </div>

    </div>
  );
}

export default ReportGarbage;