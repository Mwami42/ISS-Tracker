import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as satellite from "satellite.js";

const InfoBox = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  border-radius: 5px;
`;

const ISSInfoBox = ({ issTLE }) => {
  const [issData, setIssData] = useState({
    latitude: "",
    longitude: "",
    altitude: "",
    velocity: "",
  });

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

  useEffect(() => {
    const intervalId = setInterval(updateIssData, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [issTLE]);

  return (
    <InfoBox>
      <div>Latitude: {issData.latitude}</div>
      <div>Longitude: {issData.longitude}</div>
      <div>Altitude: {issData.altitude} km</div>
      <div>Velocity: {issData.velocity} km/h</div>
    </InfoBox>
  );
};

export default ISSInfoBox;
