import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Act1Gate from './scenes/Act1Gate';
import Act2Drift from './scenes/Act2Drift';
import Act4Clearing from './scenes/Act4Clearing';
import FrogTest from './scenes/FrogTest';
import WorldPreview from './world/WorldPreview';

type Scene = 'gate' | 'drift' | 'clearing' | 'frogtest';

export default function App() {
  const [scene, setScene] = useState<Scene>('gate');

  // URL flags for testing individual systems without breaking the main flow
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === 'frog') return <FrogTest />;
    if (params.get('view') === 'world') return <WorldPreview />;
  }

  return (
    <AnimatePresence mode="wait">
      {scene === 'gate' && (
        <Act1Gate key="gate" onComplete={() => setScene('drift')} />
      )}
      {scene === 'drift' && (
        <Act2Drift key="drift" onComplete={() => setScene('clearing')} />
      )}
      {scene === 'clearing' && (
        <Act4Clearing key="clearing" />
      )}
    </AnimatePresence>
  );
}