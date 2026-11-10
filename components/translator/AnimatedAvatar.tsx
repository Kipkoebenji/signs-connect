"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AnimationAction, AnimationMixer, LoopRepeat } from "three";
import { BVHLoader } from "three/addons/loaders/BVHLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import { bvhToAvatarClip } from "@/lib/retargetBvh";

const AVATAR_URL = "/avatars/my-avatar.glb";
const IDLE_URL = "/animations/idle.bvh";
const SIGNING_URL = "/animations/i-want-to-buy-milk.bvh";
const SIGNING_TEXT = "i want to buy milk";
const SIGNING_DURATION_MS = 10_000;

interface AnimatedAvatarProps {
  text: string;
}

function isSigningPhrase(text: string) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[.,!?]+$/, "") === SIGNING_TEXT
  );
}

export function AnimatedAvatar({ text }: AnimatedAvatarProps) {
  const gltf = useGLTF(AVATAR_URL);

  // The clone is what we render and animate. `gltf.scene` is never animated,
  // so it always stays in its rest pose and is safe to read rest data from.
  const model = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<{
    idle: AnimationAction;
    signing: AnimationAction;
  } | null>(null);
  const [mixerReady, setMixerReady] = useState(false);
  const phraseMatched = isSigningPhrase(text);

  useEffect(() => {
    let cancelled = false;
    let mixer: AnimationMixer | null = null;

    async function init() {
      try {
        const loader = new BVHLoader();
        loader.animateBonePositions = false; // keep the avatar in place
        loader.animateBoneRotations = true;

        const [idleBvh, signingBvh] = await Promise.all([
          loader.loadAsync(IDLE_URL),
          loader.loadAsync(SIGNING_URL),
        ]);
        if (cancelled) return;

        // Build a clip whose tracks target the avatar's own bones.
        const idleClip = bvhToAvatarClip(gltf.scene, idleBvh, "idle");
        const signingClip = bvhToAvatarClip(
          gltf.scene,
          signingBvh,
          "i-want-to-buy-milk",
        );

        mixer = new AnimationMixer(model);
        const idleAction = mixer.clipAction(idleClip);
        idleAction.setLoop(LoopRepeat, Infinity);
        const signingAction = mixer.clipAction(signingClip);
        signingAction.setLoop(LoopRepeat, Infinity);
        actionsRef.current = { idle: idleAction, signing: signingAction };
        idleAction.play();

        mixerRef.current = mixer;
        setMixerReady(true);
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
      actionsRef.current = null;
      setMixerReady(false);
    };
  }, [gltf.scene, model]);

  useEffect(() => {
    if (!mixerReady || !actionsRef.current) return;

    const { idle, signing: signingAction } = actionsRef.current;
    const nextAction = phraseMatched ? signingAction : idle;
    const previousAction = phraseMatched ? idle : signingAction;

    previousAction.fadeOut(0.2);
    nextAction.reset().fadeIn(0.2).play();

    if (!phraseMatched) return;

    const timeout = window.setTimeout(() => {
      signingAction.fadeOut(0.2);
      idle.reset().fadeIn(0.2).play();
    }, SIGNING_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [mixerReady, phraseMatched]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={model} />;
}

useGLTF.preload(AVATAR_URL);
