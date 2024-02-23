import { useRef, useEffect } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { useThree } from "@react-three/fiber";

const ISSTracker = ({ issTLE }) => {
  const { scene } = useThree();
  const issMarkerRef = useRef();
  console.log(`Line1: ${issTLE.line1}`);

  useEffect(() => {
    const issGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const issMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    issMarkerRef.current = new THREE.Mesh(issGeometry, issMaterial);
    scene.add(issMarkerRef.current);
  }, [scene]);

  useEffect(() => {
    const updatePosition = () => {
      if (!issTLE.line1 || !issTLE.line2) return;

      const satrec = satellite.twoline2satrec(issTLE.line1, issTLE.line2);
      const { position } = satellite.propagate(satrec, new Date());

      if (position) {
        const gmst = satellite.gstime(new Date());
        const geodeticCoords = satellite.eciToGeodetic(position, gmst);

        const lat = satellite.degreesLat(geodeticCoords.latitude);
        const lon = satellite.degreesLong(geodeticCoords.longitude);

        const issPosition = latLongToVector3(lat, lon, 2.005 + 0.05);
        issMarkerRef.current.position.set(
          issPosition.x,
          issPosition.y,
          issPosition.z
        );
      }
    };

    const intervalId = setInterval(updatePosition, 1000); // Update every seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [issTLE]);

  useEffect(() => {
    const updateOrbit = () => {
      let orbitPoints = [];
      let pastOrbitPoints = [];
      let futureOrbitPoints = [];
      const currentTime = new Date();

      if (!issTLE.line1 || !issTLE.line2) return;
      const satrec = satellite.twoline2satrec(issTLE.line1, issTLE.line2);

      for (let i = -90; i <= 90; i += 1) {
        const time = new Date(currentTime.getTime() + i * 60000); // i minutes from now

        const { position } = satellite.propagate(satrec, time);
        if (position) {
          const gmst = satellite.gstime(time);
          const geodeticCoords = satellite.eciToGeodetic(position, gmst);
          const lat = satellite.degreesLat(geodeticCoords.latitude);
          const lon = satellite.degreesLong(geodeticCoords.longitude);
          const pos = latLongToVector3(lat, lon, 2.005 + 0.05); // Assuming earth radius + altitude
          orbitPoints.push({
            time: time,
            position: new THREE.Vector3(pos.x, pos.y, pos.z),
          });
        }
      }

      // Find the current position index
      const currentIndex = orbitPoints.findIndex(
        (point) => point.time >= currentTime
      );

      // Split into past and future
      pastOrbitPoints = orbitPoints
        .slice(0, currentIndex + 1)
        .map((point) => point.position); // +1 includes current position in past
      futureOrbitPoints = orbitPoints
        .slice(currentIndex)
        .map((point) => point.position); // starts from current position

      // Create the past trajectory line
      const pastGeometry = new THREE.BufferGeometry().setFromPoints(
        pastOrbitPoints
      );
      const pastMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const pastOrbitLine = new THREE.Line(pastGeometry, pastMaterial);

      // Create the future trajectory line
      const futureGeometry = new THREE.BufferGeometry().setFromPoints(
        futureOrbitPoints
      );
      const futureMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const futureOrbitLine = new THREE.Line(futureGeometry, futureMaterial);

      scene.add(pastOrbitLine);
      scene.add(futureOrbitLine);
    };

    updateOrbit();

    const intervalId = setInterval(updateOrbit, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [issTLE]); // Dependency array

  function latLongToVector3(latitude, longitude, earthRadius) {
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -(earthRadius * Math.sin(phi) * Math.cos(theta));
    const z = earthRadius * Math.sin(phi) * Math.sin(theta);
    const y = earthRadius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  return null;
};

export default ISSTracker;
