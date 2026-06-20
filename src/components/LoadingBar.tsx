/**
 * Chunky video-game loading bar — 24 segments, fills amber-gold.
 * Designed to feel like a PS1/Sega Saturn era progress indicator.
 */
const SEGMENTS = 24;

export default function LoadingBar({ progress }: { progress: number }) {
  const filled = Math.round((progress / 100) * SEGMENTS);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#D4AF37',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.3em',
          opacity: 0.85,
          textShadow: '0 0 8px rgba(212,175,55,0.5)',
        }}
      >
        LOADING — {String(Math.floor(progress)).padStart(3, '0')}%
      </div>
      <div
        style={{
          display: 'flex',
          gap: 3,
          padding: 4,
          border: '2px solid #D4AF37',
          background: 'rgba(212,175,55,0.05)',
          boxShadow: '0 0 12px rgba(212,175,55,0.3), inset 0 0 8px rgba(0,0,0,0.5)',
        }}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const isFilled = i < filled;
          return (
            <div
              key={i}
              style={{
                width: 9,
                height: 18,
                background: isFilled ? '#D4AF37' : 'transparent',
                boxShadow: isFilled
                  ? '0 0 6px #D4AF37, inset 0 0 3px rgba(255,255,255,0.4)'
                  : 'none',
                transition: 'background 60ms linear',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}