import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Earth from "./components/Earth";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const [issPosition, setIssPosition] = useState({ lat: 0, long: 0 });

  useEffect(() => {
    const fetchIssPosition = () => {
      fetch("http://api.open-notify.org/iss-now.json")
        .then((response) => response.json())
        .then((data) => {
          setIssPosition({
            lat: parseFloat(data.iss_position.latitude),
            long: parseFloat(data.iss_position.longitude),
          });
        })
        .catch((error) => console.error("Error fetching ISS position:", error));
    };

    const intervalId = setInterval(fetchIssPosition, 5000); // Update ISS position every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <CanvasContainer>
      <Canvas>
        <Suspense fallback={null}>
          <Earth issPosition={issPosition} />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
}

export default App;
