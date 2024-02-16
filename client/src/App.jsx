import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Earth from "./components/Earth";
import ISSTracker from "./components/ISSTracker";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const [issTLE, setIssTLE] = useState({ line1: "", line2: "" });

  useEffect(() => {
    fetch("https://phrasal-waters-414515.ew.r.appspot.com/api/tle") // You probably need to verify this API endpoint when deploying client (Maybe use relative URL) (- Your future self)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch TLE data");
        return response.json();
      })
      .then((data) => {
        setIssTLE({ line1: data.line2, line2: data.line3 });
      })
      .catch((error) => {
        console.error("Error fetching TLE data from server:", error);
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
