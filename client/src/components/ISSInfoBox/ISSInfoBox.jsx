import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as satellite from "satellite.js";
import "./ISSInfoBox.css";

const ISSInfoBox = ({ issTLE }) => {
  const [issData, setIssData] = useState({
    latitude: "",
    longitude: "",
    altitude: "",
    velocity: "",
  });
  const [isMetric, setIsMetric] = useState(true);

  const updateIssData = () => {
    if (issTLE.line1 && issTLE.line2) {
      const satrec = satellite.twoline2satrec(issTLE.line1, issTLE.line2);
      const positionAndVelocity = satellite.propagate(satrec, new Date());
      const positionEci = positionAndVelocity.position;

      // Convert the position from ECI to geographic coordinates
      const gmst = satellite.gstime(new Date());
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      // Calculate velocity (magnitude of the velocity vector)
      const velocity =
        Math.sqrt(
          positionAndVelocity.velocity.x ** 2 +
            positionAndVelocity.velocity.y ** 2 +
            positionAndVelocity.velocity.z ** 2
        ) *
        60 *
        60; // Convert from km/s to km/h by multiplying with 3600

      setIssData({
        latitude: `${Math.abs(
          satellite.degreesLat(positionGd.latitude)
        ).toFixed(2)}${
          satellite.degreesLat(positionGd.latitude) >= 0 ? "N" : "S"
        }`,
        longitude: `${Math.abs(
          satellite.degreesLong(positionGd.longitude)
        ).toFixed(2)}${
          satellite.degreesLong(positionGd.longitude) >= 0 ? "E" : "W"
        }`,
        altitude: positionGd.height.toFixed(2), // Altitude in kilometers
        velocity: velocity.toFixed(0), // Velocity in km/h
      });
    }
  };

  const toggleUnits = () => {
    setIsMetric(!isMetric); // Toggle between metric and imperial units
  };

  useEffect(() => {
    const intervalId = setInterval(updateIssData, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [issTLE]);

  const formattedData = {
    // Convert and format data based on the selected unit system
    altitude: isMetric
      ? `${issData.altitude} km`
      : `${(issData.altitude * 0.621371).toFixed(0)} miles`,
    velocity: isMetric
      ? `${issData.velocity} km/h`
      : `${(issData.velocity * 0.621371).toFixed(0)} mph`,
  };

  return (
    <div className="iss-info-box">
      <div className="iss-info-header">ISS Tracker Info</div>
      <div className="iss-info-content">Latitude: {issData.latitude}</div>
      <div className="iss-info-content">Longitude: {issData.longitude}</div>
      <div className="iss-info-content">Altitude: {formattedData.altitude}</div>
      <div className="iss-info-content">Velocity: {formattedData.velocity}</div>
      <div className="unit-toggle-container">
        <label className="switch">
          {
            <div className="unit-toggle">
              <input
                type="checkbox"
                id="unit-toggle-checkbox"
                className="unit-toggle-checkbox"
                checked={!isMetric}
                onChange={toggleUnits}
              />
              <label
                className="unit-toggle-label"
                htmlFor="unit-toggle-checkbox"
              >
                <span className="unit-toggle-inner" />
                <span className="unit-toggle-switch" />
              </label>
            </div>
          }
        </label>
        <div className="unit-text">Metric / Imperial</div>
      </div>
    </div>
  );
};

export default ISSInfoBox;
