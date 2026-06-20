/**
 * WorldPreview — Standalone preview of the world skeleton + path + camera.
 *
 * Mounts everything inside a Canvas. Access via:
 *   ?view=world                     → start at scroll 0% (Act 3 entry)
 *   ?view=world&scroll=0.5          → start at scroll 50% (mid dense jungle)
 *   ?view=world&scroll=0.92         → start at scroll 92% (Act 4 reveal)
 *
 * Keyboard controls in preview:
 *   Q / E  →  ±5% scroll
 *   A / D  →  ±0.5% scroll (fine)
 *   0      →  scroll to 0% (start)
 *   1      →  scroll to 100% (Act 4)
 */

import WorldCanvas from './WorldCanvas';

export default function WorldPreview() {
  return <WorldCanvas />;
}