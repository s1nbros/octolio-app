import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button } from '../lib/ui';
import { ExplainMistake } from './ExplainMistake';
import { colors, radius, spacing } from '../lib/theme';
import { BossBattle, BudgetSlider, CompoundSim, CoverageCalc, DebtPayoff, IncomeStreams, MatchTerms, OrderItems, PortfolioPie, RiskMatrix, RpgScenario, SortItems, SpeedRound, StockChart, SwipeSort, TaxBrackets, UnitPrice } from './exerciseTypes';

export interface Exercise { id: string; type: string; xp: number; [k: string]: any; }
export const en = (v: any): string => (v && typeof v === 'object' ? v.en ?? '' : v ?? '');

/** Renders a single exercise and reports the result via onAnswer. Shared by the
 *  lesson runner and the spaced-repetition review flow. Supports theory, choice,
 *  true_false, fill_blank, fill_number, scenario_decision, sort_items, match_terms,
 *  order_items, swipe_sort, speed_round, rpg_scenario, boss_battle, stock_chart,
 *  budget_slider, portfolio_pie, coverage_calc, tax_brackets, debt_payoff,
 *  compound_sim, income_streams, unit_price, risk_matrix; only the big board
 *  games (rat_race, life_sim) still fall back. */
export function ExerciseView({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [val, setVal] = useState('');
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const checked = state !== 'idle';

  if (exercise.type === 'theory') {
    return (
      <View>
        {(exercise.slides ?? []).map((s: any, i: number) => (
          <View key={i} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md }}>
            {s.emoji || s.icon ? <Text style={{ fontSize: 36, marginBottom: spacing.sm }}>{s.emoji || s.icon}</Text> : null}
            {s.title ? <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '800', marginBottom: 6 }}>{en(s.title)}</Text> : null}
            <Text style={{ color: colors.fgMuted, fontSize: 15, lineHeight: 22 }}>{en(s.body ?? s.content ?? s.text)}</Text>
          </View>
        ))}
        <Button title="Continue" onPress={() => onAnswer(true, 0)} />
      </View>
    );
  }

  if (exercise.type === 'choice') {
    const check = () => {
      if (sel === null) return;
      const correct = sel === exercise.correctIndex;
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.question)} />
        {(exercise.options ?? []).map((o: any, i: number) => (
          <OptionRow key={i} label={en(o)} selected={sel === i}
            state={checked ? (i === exercise.correctIndex ? 'correct' : i === sel ? 'wrong' : 'idle') : 'idle'}
            disabled={checked} onPress={() => setSel(i)} />
        ))}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {!checked ? <Button title="Check" onPress={check} disabled={sel === null} />
          : state === 'wrong' ? (
            <>
              <ExplainMistake exercise={exercise} userAnswer={sel !== null ? en(exercise.options?.[sel]) : undefined} />
              <Button title="Continue" onPress={() => onAnswer(false, 0)} />
            </>
          ) : null}
      </View>
    );
  }

  if (exercise.type === 'true_false') {
    const pick = (v: boolean) => {
      const correct = v === exercise.isTrue;
      setSel(v ? 0 : 1);
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.statement)} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[{ v: true, t: 'True' }, { v: false, t: 'False' }].map(({ v, t }) => (
            <Pressable key={t} disabled={checked} onPress={() => pick(v)}
              style={{ flex: 1, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center',
                borderColor: checked && v === exercise.isTrue ? colors.green : colors.border, backgroundColor: colors.card }}>
              <Text style={{ color: colors.fg, fontWeight: '800' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {checked && state === 'wrong' ? (
          <>
            <ExplainMistake exercise={exercise} userAnswer={sel === 0 ? 'True' : 'False'} />
            <Button title="Continue" onPress={() => onAnswer(false, 0)} />
          </>
        ) : null}
      </View>
    );
  }

  if (exercise.type === 'fill_blank') {
    const check = () => {
      const n = parseFloat(val.replace(/[^0-9.]/g, ''));
      if (isNaN(n)) return;
      const min = exercise.answerMin ?? (exercise.correctAnswer - 0.01);
      const max = exercise.answerMax ?? (exercise.correctAnswer + 0.01);
      const correct = n >= min && n <= max;
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.question)} />
        <TextInput value={val} onChangeText={setVal} keyboardType="numeric" editable={!checked} placeholder="Your answer"
          placeholderTextColor={colors.fgSubtle}
          style={inputStyle} />
        {checked && state === 'wrong' ? <Text style={{ color: colors.red, marginBottom: spacing.sm }}>Correct answer: {exercise.correctAnswer}{exercise.answerUnit ?? ''}</Text> : null}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {!checked ? <Button title="Check" onPress={check} disabled={!val.trim()} />
          : state === 'wrong' ? (
            <>
              <ExplainMistake exercise={exercise} userAnswer={val || undefined} />
              <Button title="Continue" onPress={() => onAnswer(false, 0)} />
            </>
          ) : null}
      </View>
    );
  }

  if (exercise.type === 'fill_number') {
    const answer = exercise.fillNumberAnswer ?? 0;
    const unit = exercise.fillNumberUnit ?? '';
    const check = () => {
      const n = parseFloat(val.replace(/[^0-9.\-]/g, ''));
      if (isNaN(n)) return;
      const tol = exercise.fillNumberTolerance ?? Math.abs(answer * 0.05);
      const correct = Math.abs(n - answer) <= tol;
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        {exercise.fillNumberScenario ? <ScenarioBox text={en(exercise.fillNumberScenario)} /> : null}
        {exercise.question ? <Prompt text={en(exercise.question)} /> : null}
        <TextInput value={val} onChangeText={setVal} keyboardType="numeric" editable={!checked} placeholder={`${unit}Your answer`}
          placeholderTextColor={colors.fgSubtle}
          style={inputStyle} />
        {checked && state === 'wrong' ? <Text style={{ color: colors.red, marginBottom: spacing.sm }}>The answer is {unit}{answer.toLocaleString()}</Text> : null}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {!checked ? <Button title="Check" onPress={check} disabled={!val.trim()} />
          : state === 'wrong' ? (
            <>
              <ExplainMistake exercise={exercise} userAnswer={val || undefined} />
              <Button title="Continue" onPress={() => onAnswer(false, 0)} />
            </>
          ) : null}
      </View>
    );
  }

  if (exercise.type === 'scenario_decision') {
    const choices: any[] = exercise.decisionChoices ?? [];
    const pick = (i: number) => {
      if (checked) return;
      const correct = !!choices[i]?.isBest;
      setSel(i);
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 1100);
    };
    return (
      <View>
        <ScenarioBox text={en(exercise.decisionScenario)} />
        {choices.map((c, i) => (
          <OptionRow key={i} label={`${c.emoji ?? ''} ${en(c.label)}`.trim()} selected={sel === i}
            state={checked ? (c.isBest ? 'correct' : i === sel ? 'wrong' : 'idle') : 'idle'}
            disabled={checked} onPress={() => pick(i)} />
        ))}
        {checked && sel !== null ? (
          <View style={{ backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
            <Text style={{ color: colors.fgMuted, lineHeight: 21 }}>{en(choices[sel].outcome)}</Text>
          </View>
        ) : null}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {checked && state === 'wrong' ? (
          <>
            <ExplainMistake exercise={exercise} userAnswer={sel !== null ? en(choices[sel].label) : undefined} />
            <Button title="Continue" onPress={() => onAnswer(false, 0)} />
          </>
        ) : null}
      </View>
    );
  }

  if (exercise.type === 'sort_items') return <SortItems exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'match_terms') return <MatchTerms exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'order_items') return <OrderItems exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'swipe_sort') return <SwipeSort exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'speed_round') return <SpeedRound exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'rpg_scenario') return <RpgScenario exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'boss_battle') return <BossBattle exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'stock_chart') return <StockChart exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'budget_slider') return <BudgetSlider exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'portfolio_pie') return <PortfolioPie exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'coverage_calc') return <CoverageCalc exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'tax_brackets') return <TaxBrackets exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'debt_payoff') return <DebtPayoff exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'compound_sim') return <CompoundSim exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'income_streams') return <IncomeStreams exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'unit_price') return <UnitPrice exercise={exercise} onAnswer={onAnswer} />;
  if (exercise.type === 'risk_matrix') return <RiskMatrix exercise={exercise} onAnswer={onAnswer} />;

  return (
    <View>
      <Prompt text={en(exercise.question) || en(exercise.statement) || 'Interactive exercise'} />
      <Text style={{ color: colors.fgMuted, marginBottom: spacing.lg }}>
        This exercise type isn't available on mobile yet — it's on the web app. Tap continue to keep going.
      </Text>
      <Button title="Continue" onPress={() => onAnswer(true, exercise.xp)} />
    </View>
  );
}

const inputStyle = { height: 52, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 18, marginBottom: spacing.md } as const;

function Prompt({ text }: { text: string }) {
  return <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: spacing.md }}>{text}</Text>;
}
function OptionRow({ label, selected, state, disabled, onPress }: { label: string; selected: boolean; state: 'idle' | 'correct' | 'wrong'; disabled: boolean; onPress: () => void }) {
  const border = state === 'correct' ? colors.green : state === 'wrong' ? colors.red : selected ? colors.primary : colors.border;
  return (
    <Pressable disabled={disabled} onPress={onPress}
      style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: colors.card, marginBottom: spacing.sm }}>
      <Text style={{ color: colors.fg, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}
function Explanation({ checked, state, text }: { checked: boolean; state: string; text: string }) {
  if (!checked || !text) return null;
  const good = state === 'correct';
  return (
    <View style={{ backgroundColor: good ? colors.greenSoft : 'rgba(224,87,95,0.12)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
      <Text style={{ color: good ? colors.green : colors.red, fontWeight: '700', marginBottom: 4 }}>{good ? '✓ Correct' : '✗ Not quite'}</Text>
      <Text style={{ color: colors.fgMuted, lineHeight: 21 }}>{text}</Text>
    </View>
  );
}
function ScenarioBox({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
      <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}
