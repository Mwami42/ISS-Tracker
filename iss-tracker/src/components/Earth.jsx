import React from "react";
import { useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import EarthClouds from "../assets/8k_earth_clouds.jpg";
import EarthDayMap from "../assets/8k_earth_daymap.jpg";
import EarthNightMap from "../assets/8k_earth_nightmap.jpg";
import EarthNormalMap from "../assets/8k_earth_normal_map.jpg";
import EarthSpecularMap from "../assets/8k_earth_specular_map.jpg";
import { TextureLoader } from "three";

export function Earth(props) {
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(
    TextureLoader,
    [EarthDayMap, EarthNormalMap, EarthSpecularMap, EarthClouds]
  );
  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial specularMap={specularMap} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} />
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
