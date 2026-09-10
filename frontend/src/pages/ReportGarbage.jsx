import { useState } from "react";

function ReportGarbage() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [garbageType, setGarbageType] = useState("");
  const [description, setDescription] = useState("");

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));

      setAiResult(null);
      setGarbageType("");
      setDescription("");
    }
  }

  async function analyzeWithAI() {
    if (!imageFile) {
      alert("Please upload a garbage image first.");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(",")[1];

          const response = await fetch(
            "http://localhost:5000/api/analyze-garbage",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                image: base64Image,
                mimeType: imageFile.type,
              }),
            }
          );

          const data = await response.json();

          console.log("AI result received:", data);

          if (!response.ok) {
            alert(
              data.message || "AI analysis failed."
            );

            setAiLoading(false);
            return;
          }

          setAiResult(data);

          if (data.garbageDetected) {
            setGarbageType(data.garbageType);
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
      };

      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error(
        "AI Error:",
        error
      );

      alert(
        "Something went wrong during AI analysis."
      );

      setAiLoading(false);
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },

      () => {
        alert(
          "Unable to get your location. Please allow location access."
        );

        setLocationLoading(false);
      }
    );
  }

  function handleSubmit(event) {
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

    const loggedInUser = JSON.parse(
      localStorage.getItem("loggedInUser")
    );

    if (!loggedInUser) {
      alert(
        "Please login before submitting a report."
      );

      return;
    }

    const report = {
      id: Date.now(),

      image: image,

      garbageType: garbageType,

      description: description,

      latitude: location.latitude,

      longitude: location.longitude,

      status: "Pending",

      createdAt: new Date().toISOString(),

      userEmail: loggedInUser.email,

      aiResult: aiResult,
    };

    const existingReports =
      JSON.parse(
        localStorage.getItem("garbageReports")
      ) || [];

    existingReports.push(report);

    localStorage.setItem(
      "garbageReports",
      JSON.stringify(existingReports)
    );

    console.log(
      "Garbage Report:",
      report
    );

    alert(
      "Garbage report submitted successfully!"
    );

    setImage(null);
    setImageFile(null);
    setGarbageType("");
    setDescription("");
    setLocation(null);
    setAiResult(null);
  }

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
            Help keep your neighbourhood clean by
            reporting garbage that needs attention.
          </p>
        </div>

        <div className="report-form">
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
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>

          {image && (
            <div className="ai-analysis-box">
              <button
                type="button"
                className="ai-analyze-button"
                onClick={analyzeWithAI}
                disabled={aiLoading}
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
                    {aiResult.garbageDetected
                      ? "Yes"
                      : "No"}
                  </p>

                  <p>
                    <strong>
                      Garbage Type:
                    </strong>{" "}
                    {aiResult.garbageType}
                  </p>

                  <p>
                    <strong>
                      Confidence:
                    </strong>{" "}
                    {aiResult.confidence}%
                  </p>

                  <p>
                    <strong>
                      Severity:
                    </strong>{" "}
                    {aiResult.severity}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {aiResult.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="garbage-type">
              Garbage Type
            </label>

            <select
              id="garbage-type"
              value={garbageType}
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

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              placeholder="Describe the garbage problem..."
              rows="5"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            ></textarea>
          </div>

          <div className="form-group">
            <label>
              Location
            </label>

            <button
              type="button"
              className="location-button"
              onClick={getLocation}
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
                  {location.latitude}
                </p>

                <p>
                  Longitude:{" "}
                  {location.longitude}
                </p>
              </div>
            )}

            <p className="location-note">
              Your location will help the waste
              collector find the garbage.
            </p>
          </div>

          <button
            type="button"
            className="submit-report"
            onClick={handleSubmit}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportGarbage;