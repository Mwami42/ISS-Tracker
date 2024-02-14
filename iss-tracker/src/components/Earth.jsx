import React, { useRef, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import EarthClouds from "../assets/8k_earth_clouds.jpg";
import EarthDayMap from "../assets/8k_earth_daymap.jpg";
import EarthNormalMap from "../assets/8k_earth_normal_map.jpg";
import EarthSpecularMap from "../assets/8k_earth_specular_map.jpg";
import { TextureLoader } from "three";

export function Earth({ issPosition }) {
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(
    TextureLoader,
    [EarthDayMap, EarthNormalMap, EarthSpecularMap, EarthClouds]
  );

  const { scene } = useThree();
  const issMarkerRef = useRef();

  useEffect(() => {
    // Initialize the ISS marker only once
    const issGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const issMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    issMarkerRef.current = new THREE.Mesh(issGeometry, issMaterial);
    scene.add(issMarkerRef.current);
  }, [scene]);

  useEffect(() => {
    // Update ISS marker position
    const position = latLongToVector3(issPosition.lat, issPosition.long, 2.005);
    if (issMarkerRef.current) {
      issMarkerRef.current.position.set(position.x, position.y, position.z);
    }
  }, [issPosition]);

  // This function converts geographic coordinates (latitude and longitude) into 3D Cartesian coordinates
  function latLongToVector3(latitude, longitude, earthRadius) {
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -(earthRadius * Math.sin(phi) * Math.cos(theta));
    const z = earthRadius * Math.sin(phi) * Math.sin(theta);
    const y = earthRadius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  return (
    <>
      <ambientLight intensity={2} />
      <Stars
        radius={300}
        depth={60}
        count={10000}
        factor={7}
        saturation={0}
        fade={true}
      />
      <mesh>
        <sphereGeometry args={[2.005, 32, 32]} />
        <meshPhongMaterial
          map={cloudsMap}
          opacity={0.4}
          depthWrite={true}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial specularMap={specularMap} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          metalness={0.4}
          roughness={0.7}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </mesh>
    </>
  );
}

export default Earth;
