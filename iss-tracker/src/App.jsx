import React from "react";
import "./App.css";
import EarthGlobe from "./components/EarthGlobe.jsx";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Earth } from "./components/Earth.jsx";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  return (
    <CanvasContainer>
      <Canvas>
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
}

export default App;
