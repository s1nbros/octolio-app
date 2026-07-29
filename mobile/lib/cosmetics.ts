/** Cosmetic item id → emoji (mirror of the backend catalog), for rendering the mascot. */
export const EMOJI_BY_ID: Record<string, string> = {
  hat_baseball: '🧢', hat_tophat: '🎩', hat_graduation: '🎓', hat_hardhat: '⛑️', hat_helmet: '🪖', hat_pumpkin: '🎃', hat_crown: '👑', hat_halo: '😇',
  hat_sunhat: '👒', hat_lightbulb: '💡', hat_flame: '🔥', hat_star: '⭐',
  face_goggles: '🥽', face_glasses: '🕶️', face_monocle: '🧐', face_3d: '😎', face_nerd: '🤓', face_disguise: '🥸', face_starstruck: '🤩', face_robot: '🤖',
  body_scarf: '🧣', body_bowtie: '🎀', body_vest: '🦺', body_rocket: '🚀', body_tie: '👔', body_medal: '🏅', body_guitar: '🎸', body_trophy: '🏆',
};

export const emojiFor = (id?: string | null) => (id ? EMOJI_BY_ID[id] ?? null : null);

export function rarityColor(r: string): string {
  switch (r) {
    case 'rare': return 'hsl(220, 80%, 65%)';
    case 'epic': return 'hsl(280, 70%, 65%)';
    case 'legendary': return 'hsl(40, 95%, 60%)';
    default: return 'hsl(220, 6%, 60%)';
  }
}
