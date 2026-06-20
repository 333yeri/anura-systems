import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Loads the PBR-sculpted frog from /public/assets/models/char__frog__v02.glb
 * (15k polys, ~500KB, multi-material with diffuse+normal+roughness textures,
 * subsurface scattering, sheen for waxy frog skin).
 * Hovers like a Minecraft item: slow Y rotation + gentle bob.
 */
export default function Frog(props: React.ComponentProps<'group'>) {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/models/char__frog__v02.glb');

  // Clone so we don't share materials with any other frog instance
  const cloned = useRef<THREE.Group | null>(null);
  if (!cloned.current) {
    cloned.current = scene.clone(true);
  }

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * (Math.PI * 2 / 9); // 9-second full rotation
    ref.current.position.y = Math.sin(t * 1.3) * 0.05; // gentle bob
  });

  return <primitive ref={ref} object={cloned.current} {...props} />;
}

// Preload so it's ready by the time we mount the loader
useGLTF.preload('/assets/models/char__frog__v02.glb');