import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Earth from "./components/Earth";
import ISSTracker from "./components/ISSTracker";
import localTLE from "./assets/localTLEData.txt";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const [issTLE, setIssTLE] = useState(localTLE);

  useEffect(() => {
    fetch("https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch TLE data");
        return response.text();
      })
      .then((tleText) => {
        const tleLines = tleText.trim().split("\n");
        setIssTLE({ line1: tleLines[1], line2: tleLines[2] });
      })
      .catch(() => {
        fetch(localTLE)
          .then((response) => response.text())
          .then((text) => {
            const tleLines = text.trim().split("\n");
            setIssTLE({ line1: tleLines[1], line2: tleLines[2] });
          })
          .catch((error) => console.error("Error loading local TLE:", error));
      });
  }, []);

  return (
    <CanvasContainer>
      <Canvas>
        <Suspense fallback={null}>
          <Earth />
          <ISSTracker issTLE={issTLE} />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
}

export default App;
