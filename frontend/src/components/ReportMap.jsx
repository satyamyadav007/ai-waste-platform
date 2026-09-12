import { useState } from "react";

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
  if (report.status === "Collected") {
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

function ReportMap() {
  const [reports] = useState(() => {
    return (
      JSON.parse(
        localStorage.getItem(
          "garbageReports"
        )
      ) || []
    );
  });


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


  return (
    <div className="report-map-container">

      {validReports.length > 0 ? (

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


            {validReports.map(
              (report) => (

                <Marker
                  key={report.id}
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


          {/* MAP LEGEND */}

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
            No report locations available
          </h3>

          <p>
            Garbage reports with valid
            locations will appear on the map.
          </p>

        </div>

      )}

    </div>
  );
}

export default ReportMap;