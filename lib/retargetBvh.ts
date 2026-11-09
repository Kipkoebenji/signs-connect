import {
  AnimationClip,
  Bone,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  SkinnedMesh,
  Skeleton,
} from "three";

type BvhResult = { skeleton: Skeleton; clip: AnimationClip };

/**
 * Converts a BVH clip into a clip for a skinned avatar whose bones have the
 * same names as the BVH joints (e.g. Character Creator "CC_Base_*" rigs).
 *
 * Only rotations are used. For each bone:
 *   newWorldRot = bvhWorldRot * avatarRestWorldRot
 *   localRot    = inverse(parentNewWorldRot) * newWorldRot
 *
 * This works when both rigs share (roughly) the same rest pose, even though
 * the avatar's bones have different local axes than the BVH's identity axes.
 * Call this BEFORE the avatar has been animated (while it's in rest pose).
 */
export function bvhToAvatarClip(
  model: Object3D,
  bvh: BvhResult,
  clipName = "idle",
): AnimationClip {
  model.updateMatrixWorld(true);

  // Find the avatar's bones (all meshes share one skeleton).
  let skinned: SkinnedMesh | undefined;
  model.traverse((o) => {
    if (!skinned && (o as SkinnedMesh).isSkinnedMesh) skinned = o as SkinnedMesh;
  });
  if (!skinned) throw new Error("Avatar has no SkinnedMesh");
  const targetBones = skinned.skeleton.bones;

  // Parent-first ordering of the avatar's bones.
  const depth = (b: Object3D) => {
    let d = 0;
    for (let p = b.parent; p; p = p.parent) d++;
    return d;
  };
  const ordered = [...targetBones].sort((a, b) => depth(a) - depth(b));

  // Avatar rest data.
  const restLocal = new Map<Bone, Quaternion>();
  const restWorld = new Map<Bone, Quaternion>();
  for (const b of ordered) {
    restLocal.set(b, b.quaternion.clone());
    restWorld.set(b, b.getWorldQuaternion(new Quaternion()));
  }

  // BVH data: local rotation tracks by joint name.
  const srcBones = bvh.skeleton.bones; // parents come before children
  const srcTracks = new Map<string, { values: ArrayLike<number> }>();
  let times: ArrayLike<number> | null = null;
  for (const t of bvh.clip.tracks) {
    if (!t.name.endsWith(".quaternion")) continue;
    srcTracks.set(t.name.slice(0, -".quaternion".length), t);
    times ??= t.times;
  }
  if (!times) throw new Error("BVH clip has no rotation tracks");
  const frames = times.length;

  const srcNames = new Set(srcBones.map((b) => b.name));
  const mapped = ordered.filter((b) => srcNames.has(b.name));
  if (mapped.length === 0) throw new Error("No matching bone names");

  const out = new Map<Bone, Float32Array>();
  mapped.forEach((b) => out.set(b, new Float32Array(frames * 4)));

  const srcWorld = new Map<string, Quaternion>();
  const newWorld = new Map<Bone, Quaternion>();
  const tmp = new Quaternion();
  const local = new Quaternion();

  for (let f = 0; f < frames; f++) {
    // 1. BVH world rotations for this frame.
    for (const sb of srcBones) {
      const tr = srcTracks.get(sb.name);
      const q = new Quaternion();
      if (tr) q.fromArray(tr.values as number[], f * 4);
      const parent = sb.parent && srcWorld.get(sb.parent.name);
      srcWorld.set(sb.name, parent ? parent.clone().multiply(q) : q);
    }

    // 2. Avatar world + local rotations for this frame.
    for (const b of ordered) {
      const parentNew =
        (b.parent && newWorld.get(b.parent as Bone)) ||
        (b.parent
          ? b.parent.getWorldQuaternion(new Quaternion())
          : new Quaternion());

      const sw = srcNames.has(b.name) ? srcWorld.get(b.name) : undefined;
      if (sw) {
        const wNew = sw.clone().multiply(restWorld.get(b)!);
        newWorld.set(b, wNew);
        local.copy(parentNew).invert().multiply(wNew).normalize();
        local.toArray(out.get(b)!, f * 4);
      } else {
        newWorld.set(b, tmp.copy(parentNew).multiply(restLocal.get(b)!).clone());
      }
    }
  }

  const tracks = mapped.map(
    (b) =>
      new QuaternionKeyframeTrack(
        `${b.name}.quaternion`,
        Array.from(times!),
        Array.from(out.get(b)!),
      ),
  );

  return new AnimationClip(clipName, bvh.clip.duration, tracks);
}
