import { useEffect, useState } from 'react';

interface TerminalProps {
  lines: string[];
  startProgress: number;
  endProgress: number;
  globalProgress: number;
}

/** Types out each line character-by-character between progress thresholds. */
export default function Terminal({
  lines,
  startProgress,
  endProgress,
  globalProgress,
}: TerminalProps) {
  const [typedLines, setTypedLines] = useState<string[]>(lines.map(() => ''));

  useEffect(() => {
    const range = endProgress - startProgress;
    const localT = Math.max(0, Math.min(1, (globalProgress - startProgress) / range));
    const perLine = 1 / lines.length;
    const next = lines.map((line, i) => {
      const lineStart = i * perLine;
      const within = Math.max(0, Math.min(1, (localT - lineStart) / perLine));
      const eased = 1 - Math.pow(1 - within, 1.6);
      return line.slice(0, Math.floor(eased * line.length));
    });
    setTypedLines(next);
  }, [globalProgress, lines, startProgress, endProgress]);

  const lastIncomplete = typedLines.findIndex((t, i) => t !== lines[i]);
  const cursorIndex = lastIncomplete === -1 ? typedLines.length - 1 : lastIncomplete;

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        lineHeight: 1.7,
        color: '#D4AF37',
        textShadow: '0 0 6px rgba(212,175,55,0.5)',
        letterSpacing: '0.05em',
        whiteSpace: 'pre',
        minHeight: 80,
      }}
    >
      {typedLines.map((line, i) => (
        <div key={i} style={{ minHeight: '1.7em' }}>
          <span style={{ opacity: 0.5 }}>{'> '}</span>
          <span>{line}</span>
          {i === cursorIndex && (
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 11,
                background: '#D4AF37',
                marginLeft: 1,
                verticalAlign: '-1px',
                animation: 'cursor-blink 0.9s steps(2) infinite',
              }}
            />
          )}
        </div>
      ))}
      <style>{`
        @keyframes cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}