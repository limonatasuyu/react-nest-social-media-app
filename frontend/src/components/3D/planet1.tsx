import planet from "/assets/scene.gltf";
import { useGLTF } from "@react-three/drei";

export function PlanetModel(props: any) {
  const { nodes, materials } = useGLTF(planet);
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Object_Planet_0.geometry}
        material={materials.Planet}
        position={[-0.045, 1.247, 0.066]}
        rotation={[Math.PI, 0, Math.PI]}
      />
    </group>
  );
}

useGLTF.preload("/scene.gltf");
