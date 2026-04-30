"use strict";
/**
 * Banned words for nicknames.
 * Comparison is normalised: lowercased, leetspeak digits→letters, non-letters stripped.
 * The list covers obvious profanity, slurs, hate symbols, and impersonation prefixes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BANNED_WORDS_COUNT = void 0;
exports.isNicknameBanned = isNicknameBanned;
const RAW_BANNED = [
    // Profanity (English)
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 'cock', 'pussy',
    'cunt', 'piss', 'prick', 'wanker', 'twat', 'bollocks',
    // Sexual / explicit
    'porn', 'sex', 'anal', 'boobs', 'tits', 'rape', 'rapist', 'pedo', 'pedophile',
    'incest', 'horny', 'fap', 'masturbate', 'jizz', 'cum',
    // Slurs / hate
    'nigger', 'nigga', 'faggot', 'retard', 'spic', 'chink', 'kike', 'gook',
    'tranny', 'dyke', 'gypsy', 'paki',
    // Hate / extremism
    'hitler', 'nazi', 'fuhrer', 'kkk', 'isis', 'terrorist', 'jihad',
    // Self-harm
    'suicide', 'killyourself', 'kys',
    // Substances (intent: spam/glorification)
    'cocaine', 'heroin', 'meth', 'crackhead',
    // Impersonation / staff
    'admin', 'administrator', 'moderator', 'support', 'staff', 'octolio',
    'official', 'system', 'root', 'owner', 'ceo',
    // Bulgarian profanity (common forms)
    'kur', 'kuro', 'kura', 'pich', 'pichka', 'mamatami', 'eba', 'ebal', 'duh',
    'putka', 'gay', 'pedal', 'kopele', 'mrusnik', 'shibanyak',
];
/**
 * Normalise a name: lowercase, leetspeak → letters, drop everything non-alphabetic.
 * "N1gG3r_" → "nigger". Lets the list cover most evasion attempts without false-positives
 * on names that just happen to *contain* digits.
 */
function normalise(name) {
    return name
        .toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/7/g, 't')
        .replace(/8/g, 'b')
        .replace(/[^a-z]/g, '');
}
const BANNED_NORMALISED = RAW_BANNED.map(normalise).filter(w => w.length > 0);
/**
 * Returns true if the nickname contains a banned word as a substring of its normalised form.
 * "xXfuckXx" → true; "Fuchs" (German fox) → false (normalises to "fuchs").
 */
function isNicknameBanned(name) {
    if (!name)
        return false;
    const norm = normalise(name);
    if (!norm)
        return false;
    return BANNED_NORMALISED.some(banned => norm.includes(banned));
}
exports.BANNED_WORDS_COUNT = BANNED_NORMALISED.length;
