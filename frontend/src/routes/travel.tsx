import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { PlanetModel } from "../components/3D/planet1";
import { OrbitControls } from "@react-three/drei";

export const Route = createFileRoute("/travel")({
  component: TravelPage,
});

function TravelPage() {
  const camera = {
    position: [0, 80, 0],
    fov: 55,
    near: 1,
    far: 2000,
  };

  return (
    <Canvas
      className="w-full h-screen"
      style={{ height: "100vh" }}
      camera={camera}
      gl={{ antialias: false }}
    >
      <ambientLight intensity={1} />
       <directionalLight color="red" position={[0, 0, 50]} intensity={10}/>


       <Physics gravity={[0, 0, 0]}></Physics>
      <PlanetModel />
      <OrbitControls />
    </Canvas>
  );
}

