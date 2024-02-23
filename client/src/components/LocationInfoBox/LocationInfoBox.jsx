import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as satellite from "satellite.js";
import * as turf from "@turf/turf";
import geojsonData from "./land.geo.json";
import oceanData from "./GeoOceansAndSeasV2.geo.json";
import "./LocationInfoBox.css";

const InfoBoxContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LocationInfoBox = ({ issTLE }) => {
  const [locationName, setLocationName] = useState("Calculating position...");

  useEffect(() => {
    const updateLocation = () => {
      if (issTLE.line1 && issTLE.line2) {
        const satrec = satellite.twoline2satrec(issTLE.line1, issTLE.line2);
        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(new Date());
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);

        const latitude = satellite.degreesLat(positionGd.latitude);
        const longitude = satellite.degreesLong(positionGd.longitude);
        const point = turf.point([longitude, latitude]);

        let matchedFeature = geojsonData.features.find((feature) =>
          turf.booleanPointInPolygon(point, feature)
        );

        if (!matchedFeature) {
          matchedFeature = oceanData.features.find((feature) =>
            turf.booleanPointInPolygon(point, feature)
          );
        }

        setLocationName(
          matchedFeature ? matchedFeature.properties.name : "Unknown location"
        );
      }
    };

    updateLocation();
    const intervalId = setInterval(updateLocation, 1000);

    return () => clearInterval(intervalId);
  }, [issTLE]);

  return <div className="location-info-box">{locationName}</div>;
};

export default LocationInfoBox;
