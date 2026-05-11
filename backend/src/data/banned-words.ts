/**
 * Banned words for nicknames.
 * Comparison is normalised: lowercased, leetspeak digits→letters, non-letters stripped.
 *
 * A nickname is rejected if its normalised form CONTAINS any entry as a substring.
 * Keep entries to plain a–z (the normaliser already strips digits/punctuation).
 * AVOID very short stems (≤ 3 chars) that overlap with real names — e.g. "eba" would
 * block "Sebastian", "kura" would block "Sakura". Prefer longer specific forms.
 */

const RAW_BANNED: string[] = [
  // ── Profanity (English) ──
  'fuck', 'fuk', 'fck', 'phuck', 'fuq',
  'shit', 'shyt', 'shyte', 'shite',
  'asshole', 'asshat', 'arsehole', 'azzhole',
  'bitch', 'biatch', 'beotch', 'bytch',
  'bastard', 'dickhead', 'cockhead', 'pussy',
  'cunt', 'wanker', 'twat', 'bollocks',
  'douche', 'douchebag',
  'motherfucker', 'cocksucker', 'fucker', 'fuckface', 'fuckboy', 'fuckwit',
  'jackass', 'dumbass', 'smartass',

  // ── Sexual / explicit ──
  'porn', 'porno', 'pornhub', 'xxx',
  'analsex', 'titties', 'nipple',
  'rapist', 'rapeme',
  'pedo', 'pedophile', 'paedo', 'paedophile',
  'incest', 'horny', 'fapping', 'masturbate', 'masturbation',
  'jizz', 'jism', 'cumshot', 'cumming', 'creampie',
  'blowjob', 'handjob', 'rimjob',
  'whore', 'slutty', 'hooker',
  'penis', 'vagina', 'clitoris', 'scrotum', 'testicle',
  'erection', 'orgasm', 'orgy',
  'sextoy', 'dildo', 'buttplug',

  // ── Slurs / hate ──
  'nigger', 'nigga', 'niglet',
  'faggot', 'faggit', 'faggy',
  'retard', 'retarded',
  'spicnigger', 'chink', 'kike', 'gook',
  'tranny', 'shemale',
  'wetback', 'jigaboo', 'sandnigger',
  'whitepower', 'whitepride',
  'raghead', 'towelhead',

  // ── Hate / extremism ──
  'hitler', 'adolfhitler', 'fuhrer', 'fuehrer',
  'nazi', 'nazism', 'thirdreich',
  'klan', 'sieghell', 'siegheil', 'fourteenwords',
  'isis', 'isil', 'terrorist', 'jihad', 'jihadist',
  'taliban', 'alqaeda',
  'genocide',
  'swastika', 'heilhitler',

  // ── Self-harm / violence ──
  'suicide', 'killyourself', 'killself',
  'selfharm',
  'masskill', 'massshooter',

  // ── Drugs (intent: spam/glorification) ──
  'cocaine', 'heroin', 'methhead', 'crackhead', 'crackwhore',

  // ── Impersonation / staff ──
  'admin', 'administrator', 'moderator',
  'support', 'helpdesk',
  'octolio', 'octoteam', 'octobot',
  'official', 'sysop', 'sysadmin',
  'anthropic', 'claudebot',

  // ── Bulgarian profanity (latin-transliterated forms) ──
  // Carefully chosen so they don't collide with common given names.
  'kurva', 'kurvi', 'kurveti', 'kurvar',
  'pichka', 'pichki', 'pichkata',
  'mamicata', 'mamicati', 'mamatami', 'mamkata', 'maikati',
  'ebati', 'ebavam', 'ebem', 'ebavash',
  'putka', 'putki', 'putkata',
  'pedalo', 'pedalche', 'pedaliska',
  'kopele', 'kopelence', 'kopelenata',
  'mrusnik', 'mrusnika',
  'shibanyak', 'shibana', 'shibanata',

  // ── Russian profanity (latin transliterations) ──
  // 'hui'/'suka'/'eba' deliberately omitted — too many real-name collisions.
  'huilo', 'pizdec', 'pizda', 'blyad', 'blyat',
  'mudak', 'gandon', 'pidor', 'pidoras',
];

/**
 * Normalise a name: lowercase, leetspeak → letters, drop everything non-alphabetic.
 * "N1gG3r_" → "nigger".
 */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g')
    .replace(/[^a-z]/g, '');
}

const BANNED_NORMALISED: string[] = Array.from(
  new Set(RAW_BANNED.map(normalise).filter(w => w.length >= 4)),
);

/**
 * Returns true if the nickname contains a banned word as a substring of its normalised form.
 * "xXfuckXx" → true; "Fuchs" (German fox) → false (normalises to "fuchs").
 */
export function isNicknameBanned(name: string): boolean {
  if (!name) return false;
  const norm = normalise(name);
  if (!norm) return false;
  return BANNED_NORMALISED.some(banned => norm.includes(banned));
}

export const BANNED_WORDS_COUNT = BANNED_NORMALISED.length;
