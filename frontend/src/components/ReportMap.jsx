import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// --------------------------------------------------
// DEFAULT LEAFLET MARKER ICONS
// --------------------------------------------------

const defaultIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});

// --------------------------------------------------
// PRIORITY ICONS
// --------------------------------------------------

const highPriorityIcon =
  L.divIcon({
    className: "custom-map-marker",

    html: `
      <div class="map-marker high-marker">
        🔴
      </div>
    `,

    iconSize: [35, 35],

    iconAnchor: [17, 17],
  });

const mediumPriorityIcon =
  L.divIcon({
    className: "custom-map-marker",

    html: `
      <div class="map-marker medium-marker">
        🟠
      </div>
    `,

    iconSize: [35, 35],

    iconAnchor: [17, 17],
  });

const lowPriorityIcon =
  L.divIcon({
    className: "custom-map-marker",

    html: `
      <div class="map-marker low-marker">
        🟢
      </div>
    `,

    iconSize: [35, 35],

    iconAnchor: [17, 17],
  });

const collectedIcon =
  L.divIcon({
    className: "custom-map-marker",

    html: `
      <div class="map-marker collected-marker">
        ✅
      </div>
    `,

    iconSize: [35, 35],

    iconAnchor: [17, 17],
  });

// --------------------------------------------------
// GET MARKER ICON
// --------------------------------------------------

function getMarkerIcon(report) {
  if (
    report.status === "Collected" ||
    report.status === "Resolved"
  ) {
    return collectedIcon;
  }

  if (
    report.aiResult &&
    report.aiResult.severity === "High"
  ) {
    return highPriorityIcon;
  }

  if (
    report.aiResult &&
    report.aiResult.severity === "Medium"
  ) {
    return mediumPriorityIcon;
  }

  if (
    report.aiResult &&
    report.aiResult.severity === "Low"
  ) {
    return lowPriorityIcon;
  }

  return defaultIcon;
}

// --------------------------------------------------
// REPORT MAP
// --------------------------------------------------

function ReportMap({ showFilters = false }) {
  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // FETCH REPORTS FROM MONGODB
  // --------------------------------------------------

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

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
        // NORMALIZE MONGODB REPORTS
        // --------------------------------------------------

        const normalizedReports =
          data.map(
            (report) => ({
              ...report,

              id:
                report.reportId ||
                report._id,
            })
          );

        setReports(
          normalizedReports
        );

        console.log(
          "Map reports loaded from MongoDB:",
          normalizedReports.length
        );

      } catch (error) {
        console.error(
          "Map reports fetch error:",
          error
        );

        setError(
          "Unable to load map reports from MongoDB."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // --------------------------------------------------
  // FILTER STATES
  // --------------------------------------------------

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  // --------------------------------------------------
  // VALID REPORTS
  // --------------------------------------------------

  const validReports =
    reports.filter(
      (report) =>
        report.latitude !==
          undefined &&
        report.longitude !==
          undefined &&
        !isNaN(
          Number(
            report.latitude
          )
        ) &&
        !isNaN(
          Number(
            report.longitude
          )
        )
    );

  // --------------------------------------------------
  // FILTER REPORTS
  // --------------------------------------------------

  const filteredReports =
    validReports.filter(
      (report) => {

        // --------------------------------------------------
        // STATUS FILTER
        // --------------------------------------------------

        if (
          statusFilter !==
          "All"
        ) {

          if (
            statusFilter ===
            "Collected"
          ) {

            if (
              report.status !==
                "Collected" &&
              report.status !==
                "Resolved"
            ) {
              return false;
            }

          } else if (
            report.status !==
            statusFilter
          ) {

            return false;
          }
        }

        // --------------------------------------------------
        // PRIORITY FILTER
        // --------------------------------------------------

        if (
          priorityFilter !==
          "All"
        ) {

          const severity =
            report.aiResult
              ? report.aiResult.severity
              : "Unknown";

          if (
            severity !==
            priorityFilter
          ) {
            return false;
          }
        }

        return true;
      }
    );

  // --------------------------------------------------
  // MAP CENTER
  // --------------------------------------------------

  const defaultCenter =
    validReports.length > 0
      ? [
          Number(
            validReports[0]
              .latitude
          ),

          Number(
            validReports[0]
              .longitude
          ),
        ]
      : [28.6139, 77.2090];

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="map-empty">

        <div>
          🗺️
        </div>

        <h3>
          Loading Map
        </h3>

        <p>
          Loading garbage reports from MongoDB...
        </p>

      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="map-empty">

        <div>
          ⚠️
        </div>

        <h3>
          Unable to Load Map
        </h3>

        <p>
          {error}
        </p>

      </div>
    );
  }

  return (
    <div className="report-map-container">

      {/* --------------------------------------------------
          ADMIN FILTERS
      -------------------------------------------------- */}

      {showFilters && (

        <div className="map-filters">

          <div className="map-filter-group">

            <label htmlFor="status-filter">
              Report Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Reports
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Collected">
                Collected
              </option>

            </select>

          </div>

          <div className="map-filter-group">

            <label htmlFor="priority-filter">
              AI Priority
            </label>

            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="Low">
                Low Priority
              </option>

            </select>

          </div>

        </div>

      )}

      {/* --------------------------------------------------
          MAP
      -------------------------------------------------- */}

      {filteredReports.length > 0 ? (

        <>

          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="report-map"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredReports.map(
              (report) => (

                <Marker
                  key={
                    report.id
                  }

                  position={[
                    Number(
                      report.latitude
                    ),

                    Number(
                      report.longitude
                    ),
                  ]}

                  icon={getMarkerIcon(
                    report
                  )}
                >

                  <Popup>

                    <div className="map-popup">

                      <strong>
                        Report #{report.id}
                      </strong>

                      <p>
                        <strong>
                          Garbage Type:
                        </strong>{" "}
                        {
                          report.garbageType
                        }
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {
                          report.status
                        }
                      </p>

                      {report.aiResult && (
                        <>
                          <p>
                            <strong>
                              AI Severity:
                            </strong>{" "}
                            {
                              report
                                .aiResult
                                .severity
                            }
                          </p>

                          <p>
                            <strong>
                              AI Confidence:
                            </strong>{" "}
                            {
                              report
                                .aiResult
                                .confidence
                            }%
                          </p>
                        </>
                      )}

                      <p>
                        <strong>
                          Location:
                        </strong>
                      </p>

                      <p>
                        {report.latitude},{" "}
                        {report.longitude}
                      </p>

                    </div>

                  </Popup>

                </Marker>

              )
            )}

          </MapContainer>

          {/* --------------------------------------------------
              MAP LEGEND
          -------------------------------------------------- */}

          <div className="map-legend">

            <strong>
              Map Legend
            </strong>

            <div className="legend-item">
              <span>🔴</span>
              High Priority
            </div>

            <div className="legend-item">
              <span>🟠</span>
              Medium Priority
            </div>

            <div className="legend-item">
              <span>🟢</span>
              Low Priority
            </div>

            <div className="legend-item">
              <span>✅</span>
              Collected
            </div>

          </div>

        </>

      ) : (

        <div className="map-empty">

          <div>
            🗺️
          </div>

          <h3>
            No matching reports
          </h3>

          <p>
            Try changing the map filters.
          </p>

        </div>

      )}

    </div>
  );
}

export default ReportMap;