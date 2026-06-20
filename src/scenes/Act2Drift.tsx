import { motion } from 'framer-motion';

/**
 * Act 2 — The Drift (PLACEHOLDER).
 * Will be built AFTER Act 1 approval: first-person camera drifts through the
 * swamp, frog hops 3-5m ahead of the camera, your tree .glb files scattered
 * in the scene, fog, moonlight shafts, etc.
 */
export default function Act2Drift({ onComplete: _ }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
        color: '#D4AF37',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: '0.4em' }}>
        [ACT 2 / 5] — THE DRIFT
      </div>
      <div style={{ fontSize: 24, letterSpacing: '0.2em' }}>COMING SOON</div>
      <div style={{ fontSize: 11, opacity: 0.5, maxWidth: 400, textAlign: 'center' }}>
        After you approve Act 1 — first-person drift through the swamp,
        frog hopping ahead, your trees filling the scene.
      </div>
    </motion.div>
  );
}