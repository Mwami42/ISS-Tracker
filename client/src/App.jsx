import React, { useState, useEffect } from "react";
import "./App.css";
import styled, { keyframes } from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Earth from "./components/Earth";
import ISSTracker from "./components/ISSTracker";
import ISSInfoBox from "./components/ISSInfoBox/ISSInfoBox";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingScreen = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
  font-size: 1.5em;

  &::after {
    content: "";
    width: 50px;
    height: 50px;
    border: 5px solid white;
    border-top: 5px solid gray;
    border-radius: 50%;
    animation: ${rotate} 2s linear infinite;
  }
`;

function App() {
  const [issTLE, setIssTLE] = useState({ line1: "", line2: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://phrasal-waters-414515.ew.r.appspot.com/api/tle") // You probably need to verify this API endpoint when deploying client (Maybe use relative URL) (- Your future self)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch TLE data");
        return response.json();
      })
      .then((data) => {
        setIssTLE({ line1: data.line1, line2: data.line2 });
        setIsLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching TLE data from server:", error);
        setIsLoading(false); // Also set loading to false in case of error
      });
  }, []);

  return (
    <>
      {isLoading && (
        <LoadingScreen>
          <div>Establishing connection with ISS...</div>
        </LoadingScreen>
      )}
      <CanvasContainer>
        <Canvas>
          <Suspense fallback={null}>
            <Earth />
            <ISSTracker issTLE={issTLE} />
          </Suspense>
        </Canvas>
        <ISSInfoBox issTLE={issTLE} />
      </CanvasContainer>
    </>
  );
}

export default App;
