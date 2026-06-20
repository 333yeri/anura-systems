import { motion } from 'framer-motion';

/**
 * Act 4 — The Clearing (PLACEHOLDER).
 * Will be built AFTER Act 2 — campfire scene with Yeri character, tent,
 * final CTA "IF YOU ARE WORTHY OF OUR PROCESS" triggering the application
 * questionnaire (Act 5).
 */
export default function Act4Clearing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        [ACT 4 / 5] — THE CLEARING
      </div>
      <div style={{ fontSize: 24, letterSpacing: '0.2em' }}>COMING SOON</div>
      <div style={{ fontSize: 11, opacity: 0.5 }}>
        Yeri at the campfire · maroon tent · CTA — built last.
      </div>
    </motion.div>
  );
}