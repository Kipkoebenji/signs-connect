"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AnimationMixer, LoopRepeat } from "three";
import { BVHLoader } from "three/addons/loaders/BVHLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import { bvhToAvatarClip } from "@/lib/retargetBvh";

const AVATAR_URL = "/avatars/my-avatar.glb";
const IDLE_URL = "/animations/idle.bvh";

export function AnimatedAvatar() {
  const gltf = useGLTF(AVATAR_URL);

  // The clone is what we render and animate. `gltf.scene` is never animated,
  // so it always stays in its rest pose and is safe to read rest data from.
  const model = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mixer: AnimationMixer | null = null;

    async function init() {
      try {
        const loader = new BVHLoader();
        loader.animateBonePositions = false; // keep the avatar in place
        loader.animateBoneRotations = true;

        const bvh = await loader.loadAsync(IDLE_URL);
        if (cancelled) return;

        // Build a clip whose tracks target the avatar's own bones.
        const clip = bvhToAvatarClip(gltf.scene, bvh, "idle");

        mixer = new AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.setLoop(LoopRepeat, Infinity);
        action.play();

        mixerRef.current = mixer;
      } catch (error) {
        console.error("Avatar initialization failed:", error);
      }
    }

    init();

    return () => {
      cancelled = true;
      mixer?.stopAllAction();
      mixer?.uncacheRoot(model);
      mixerRef.current = null;
    };
  }, [gltf.scene, model]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={model} />;
}

useGLTF.preload(AVATAR_URL);
