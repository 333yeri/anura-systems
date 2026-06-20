import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import Frog from '../r3f/Frog';

/**
 * Test page that shows ONLY the frog — used to verify the v02 PBR frog
 * before integrating it into the full Act 1 scene.
 * Remove this file once Act 1 is approved.
 */
export default function FrogTest() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.0], fov: 35 }}
      gl={{ antialias: true }}
      style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}
    >
      <Environment preset="studio" />

      {/* lighting */}
      <directionalLight position={[3, 4, 5]} intensity={2.0} color="#FFE8C0" />
      <directionalLight position={[-3, 2, 3]} intensity={0.8} color="#7a8b5a" />
      <directionalLight position={[0, 3, -4]} intensity={1.5} color="#D4AF37" />
      <ambientLight intensity={0.5} />

      <Frog scale={1.0} position={[0, 0, 0]} />

      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          offset={0.3}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}