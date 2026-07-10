"use strict";
// ───────────────────────────────────────────────────────────────
// testout.ts — "Test out of a module" quiz.
//
// Lets a user who already knows a module's material prove it with a short
// quiz drawn from that module's own exercises. Passing marks every lesson in
// the module complete (so they skip the basics) and awards a modest flat XP
// bonus — NOT the full per-lesson XP, so it can't be farmed.
//
// Grading is server-side: correct answers never leave the backend, and the
// quiz is derived deterministically from the module so a POST can re-derive
// the exact same questions to grade against.
// ───────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.testoutRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const lessons_1 = require("../data/lessons");
const streak_1 = require("../services/streak");
const friends_1 = require("./friends");
const friendStreak_1 = require("../services/friendStreak");
const friendQuest_1 = require("../services/friendQuest");
exports.testoutRouter = (0, express_1.Router)();
const MIN_QUESTIONS = 4; // below this a module can't be tested out of
const MAX_QUESTIONS = 8; // quiz length cap
const PASS_RATIO = 0.8; // fraction correct needed
const TESTOUT_XP = 40; // flat bonus for passing (reduced vs doing the lessons)
const TRUE_FALSE_OPTS = [
    { en: 'True', bg: 'Вярно' },
    { en: 'False', bg: 'Невярно' },
];
/** Deterministically build the test-out quiz from a module's own multiple-choice-style exercises. */
function buildTestOut(mod) {
    const out = [];
    const push = (q) => { if (out.length < MAX_QUESTIONS)
        out.push(q); };
    for (const lesson of mod.lessons) {
        for (const ex of lesson.exercises) {
            if (out.length >= MAX_QUESTIONS)
                return out;
            if (ex.type === 'choice' && ex.question && Array.isArray(ex.options) && typeof ex.correctIndex === 'number') {
                push({ exerciseId: ex.id, lessonId: lesson.id, prompt: ex.question, options: ex.options, correctIndex: ex.correctIndex });
            }
            else if (ex.type === 'true_false' && ex.statement && typeof ex.isTrue === 'boolean') {
                push({ exerciseId: ex.id, lessonId: lesson.id, prompt: ex.statement, options: TRUE_FALSE_OPTS, correctIndex: ex.isTrue ? 0 : 1 });
            }
            else if (ex.type === 'scenario_decision' && ex.decisionScenario && Array.isArray(ex.decisionChoices)) {
                const ci = ex.decisionChoices.findIndex((c) => c.isBest);
                if (ci >= 0) {
                    push({ exerciseId: ex.id, lessonId: lesson.id, prompt: ex.decisionScenario, options: ex.decisionChoices.map((c) => c.label), correctIndex: ci });
                }
            }
            else if (ex.type === 'speed_round' && ex.speedRound?.questions) {
                ex.speedRound.questions.slice(0, 3).forEach((sq, i) => push({ exerciseId: `${ex.id}#${i}`, lessonId: lesson.id, prompt: sq.q, options: sq.options, correctIndex: sq.correctIndex }));
            }
            else if (ex.type === 'boss_battle' && ex.bossBattle?.questions) {
                ex.bossBattle.questions.slice(0, 3).forEach((sq, i) => push({ exerciseId: `${ex.id}#${i}`, lessonId: lesson.id, prompt: sq.q, options: sq.options, correctIndex: sq.correctIndex }));
            }
        }
    }
    return out;
}
/** Mirror of the frontend sequential-lock rule so users can't test out ahead. */
function isModuleUnlocked(index, isPro, completed) {
    const mod = lessons_1.modules[index];
    if (mod.proOnly && !isPro)
        return false;
    if (isPro || index === 0)
        return true;
    const prev = lessons_1.modules[index - 1];
    if (!prev || prev.proOnly)
        return true;
    const prevDone = prev.lessons.filter((l) => completed.has(l.id)).length;
    return prevDone >= 2;
}
async function loadState(userId) {
    const pool = (0, db_1.getPool)();
    const [progress, userRow] = await Promise.all([
        pool.query('SELECT lesson_id FROM progress WHERE user_id = $1', [userId]),
        pool.query('SELECT is_pro FROM users WHERE id = $1', [userId]),
    ]);
    const completed = new Set(progress.rows.map((r) => r.lesson_id));
    const isPro = userRow.rows[0]?.is_pro ?? false;
    return { completed, isPro };
}
/* ─── GET /api/testout/:moduleId — quiz WITHOUT answers ───────── */
exports.testoutRouter.get('/:moduleId', auth_1.authenticate, async (req, res) => {
    const index = lessons_1.modules.findIndex((m) => m.id === req.params.moduleId);
    if (index < 0) {
        res.status(404).json({ error: 'module_not_found' });
        return;
    }
    const mod = lessons_1.modules[index];
    try {
        const { completed, isPro } = await loadState(req.userId);
        if (mod.proOnly && !isPro) {
            res.json({ eligible: false, reason: 'pro_required' });
            return;
        }
        if (!isModuleUnlocked(index, isPro, completed)) {
            res.json({ eligible: false, reason: 'locked' });
            return;
        }
        if (mod.lessons.every((l) => completed.has(l.id))) {
            res.json({ eligible: false, reason: 'completed' });
            return;
        }
        const quiz = buildTestOut(mod);
        if (quiz.length < MIN_QUESTIONS) {
            res.json({ eligible: false, reason: 'no_quiz' });
            return;
        }
        res.json({
            eligible: true,
            moduleId: mod.id,
            title: mod.title,
            total: quiz.length,
            passNeeded: Math.ceil(quiz.length * PASS_RATIO),
            rewardXp: TESTOUT_XP,
            questions: quiz.map((q) => ({ exerciseId: q.exerciseId, prompt: q.prompt, options: q.options })),
        });
    }
    catch (err) {
        console.error('Test-out GET error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/testout/:moduleId { answers } — grade + complete ─ */
exports.testoutRouter.post('/:moduleId', auth_1.authenticate, async (req, res) => {
    const index = lessons_1.modules.findIndex((m) => m.id === req.params.moduleId);
    if (index < 0) {
        res.status(404).json({ error: 'module_not_found' });
        return;
    }
    const mod = lessons_1.modules[index];
    const answers = (req.body?.answers ?? {});
    try {
        const { completed, isPro } = await loadState(req.userId);
        if (mod.proOnly && !isPro) {
            res.status(403).json({ error: 'pro_required' });
            return;
        }
        if (!isModuleUnlocked(index, isPro, completed)) {
            res.status(403).json({ error: 'locked' });
            return;
        }
        if (mod.lessons.every((l) => completed.has(l.id))) {
            res.status(400).json({ error: 'already_completed' });
            return;
        }
        const quiz = buildTestOut(mod);
        if (quiz.length < MIN_QUESTIONS) {
            res.status(400).json({ error: 'no_quiz' });
            return;
        }
        const total = quiz.length;
        const passNeeded = Math.ceil(total * PASS_RATIO);
        const score = quiz.reduce((n, q) => (answers[q.exerciseId] === q.correctIndex ? n + 1 : n), 0);
        const passed = score >= passNeeded;
        if (!passed) {
            res.json({ passed: false, score, total, passNeeded });
            return;
        }
        const pool = (0, db_1.getPool)();
        const client = await pool.connect();
        let newXp = 0;
        let newStreak = 0;
        let name = '';
        let oldXp = 0;
        try {
            await client.query('BEGIN');
            for (const lesson of mod.lessons) {
                await client.query(`INSERT INTO progress (user_id, lesson_id, module_id, xp_earned)
           VALUES ($1, $2, $3, 0)
           ON CONFLICT (user_id, lesson_id) DO NOTHING`, [req.userId, lesson.id, mod.id]);
            }
            const u = (await client.query('SELECT xp, streak, last_active, streak_freezes, name FROM users WHERE id = $1 FOR UPDATE', [req.userId])).rows[0];
            const today = (0, streak_1.todayStr)();
            const { newStreak: ns, newFreezes } = (0, streak_1.computeStreakUpdate)({ streak: u.streak, last_active: u.last_active, streak_freezes: u.streak_freezes ?? 0 }, today);
            oldXp = u.xp;
            name = u.name;
            newXp = u.xp + TESTOUT_XP;
            newStreak = ns;
            await client.query('UPDATE users SET xp = $1, streak = $2, last_active = $3, streak_freezes = $4 WHERE id = $5', [newXp, newStreak, today, newFreezes, req.userId]);
            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK').catch(() => { });
            throw err;
        }
        finally {
            client.release();
        }
        // Fire-and-forget social hooks — test-out counts as activity today.
        const today = (0, streak_1.todayStr)();
        (0, friends_1.detectCrossesAndNotify)(req.userId, name, oldXp, newXp).catch((e) => console.error('cross-XP notify failed:', e));
        (0, friendStreak_1.updateFriendStreaksForUser)(req.userId, today).catch((e) => console.error('friend-streak update failed:', e));
        (0, friendQuest_1.contributeToFriendQuests)(req.userId, TESTOUT_XP, today).catch((e) => console.error('friend-quest contribute failed:', e));
        res.json({ passed: true, score, total, passNeeded, xpAwarded: TESTOUT_XP, totalXp: newXp, streak: newStreak });
    }
    catch (err) {
        console.error('Test-out POST error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
