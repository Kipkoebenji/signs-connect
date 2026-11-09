"use client";

import { useGLTF } from "@react-three/drei";

export function Avatar() {
  const { scene } = useGLTF("/avatars/avatar.glb");

  return <primitive object={scene} />;
}