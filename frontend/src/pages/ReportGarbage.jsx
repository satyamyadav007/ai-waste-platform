import { useState } from "react";

function ReportGarbage() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [garbageType, setGarbageType] = useState("");
  const [description, setDescription] = useState("");

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
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
        alert("Unable to get your location. Please allow location access.");
        setLocationLoading(false);
      }
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!image) {
      alert("Please upload a garbage image.");
      return;
    }

    if (!garbageType) {
      alert("Please select the garbage type.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!location) {
      alert("Please detect your location.");
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
    };

    console.log("Garbage Report:", report);

    alert("Garbage report submitted successfully!");

    setImage(null);
    setGarbageType("");
    setDescription("");
    setLocation(null);
  }

  return (
    <div className="report-page">

      <div className="report-container">

        <div className="report-heading">
          <p className="section-tag">REPORT GARBAGE</p>

          <h1>Report a Garbage Problem</h1>

          <p>
            Help keep your neighbourhood clean by reporting
            garbage that needs attention.
          </p>
        </div>

        <div className="report-form">

          {/* IMAGE UPLOAD */}

          <div className="form-group">
            <label>Garbage Image</label>

            <label className="image-upload">

              {image ? (
                <img
                  src={image}
                  alt="Garbage preview"
                />
              ) : (
                <>
                  <span className="upload-icon">📷</span>

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


          {/* GARBAGE TYPE */}

          <div className="form-group">

            <label htmlFor="garbage-type">
              Garbage Type
            </label>

            <select
              id="garbage-type"
              value={garbageType}
              onChange={(event) =>
                setGarbageType(event.target.value)
              }
            >

              <option value="">
                Select garbage type
              </option>

              <option value="household">
                Household Waste
              </option>

              <option value="plastic">
                Plastic Waste
              </option>

              <option value="construction">
                Construction Waste
              </option>

              <option value="organic">
                Organic Waste
              </option>

              <option value="mixed">
                Mixed Waste
              </option>

              <option value="other">
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
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            ></textarea>

          </div>


          {/* LOCATION */}

          <div className="form-group">

            <label>Location</label>

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
                  Latitude: {location.latitude}
                </p>

                <p>
                  Longitude: {location.longitude}
                </p>

              </div>
            )}


            <p className="location-note">
              Your location will help the waste collector
              find the garbage.
            </p>

          </div>


          {/* SUBMIT */}

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