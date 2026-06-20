/**
 * Anura — Locked 14-color palette
 * Source: _decisions/10_vqs_lock_log.md (Decision C)
 *
 * Every color used in the world MUST come from this file. No hex literals
 * scattered through components. If a new color is needed, add it here,
 * flag it for user review, then use the token.
 */

export const palette = {
  // WORLD SHADOWS & DARKS (the foundation)
  void_000:      '#0A0A0A',  // deepest shadow, near-pure-black
  shadow_warm:   '#15110D',  // warm-tinted shadow (moonlit areas)
  shadow_cool:   '#0E1F12',  // cool green-tinted shadow (canopy shadow)

  // WORLD MID-TONES (the body)
  moss_shadow:     '#142A18',
  moss_mid:        '#2D4A2A',
  moss_highlight:  '#5C7E3E',
  stone_base:      '#2A2520',
  stone_mid:       '#4A4138',
  stone_highlight: '#7A6B5E',

  // ATMOSPHERE (the depth)
  mist_cool:     '#6A7868',  // cool grey-green atmospheric fog
  mist_warm:     '#8A8270',  // warm-tinted mist (moonlit halo areas)

  // LIGHT SOURCES (the accents)
  moonlight:        '#F5EDD8',  // warm pale moonlight core
  moonlight_halo:   '#A89870',  // moon glow halo
  ember_warm:       '#D4A02A',  // fire light, warm amber-gold
  ember_glow:       '#FFB84D',  // hot ember orange
  biolume_cyan:     '#6FCFB8',  // bioluminescent cyan-green
  flower_pink:      '#A8485E',  // muted dark pink
  flower_white:     '#9A9080',  // warm cream-white
} as const;

/**
 * Convenience: convert hex to THREE.Color components (0-1 range)
 */
export function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}