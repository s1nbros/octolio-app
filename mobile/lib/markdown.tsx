import { Text, View } from 'react-native';
import { colors } from './theme';

/** Parse inline **bold** into RN <Text> spans. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <Text key={i} style={{ fontWeight: '800', color: colors.fg }}>{p.slice(2, -2)}</Text>
      : <Text key={i}>{p}</Text>);
}

/** Minimal markdown → RN renderer (headings, -/* bullets, numbered lists, bold). */
export function Markdown({ text, color = colors.fgMuted }: { text: string; color?: string }) {
  return (
    <View>
      {text.split('\n').map((raw, idx) => {
        const line = raw.replace(/\s+$/, '');
        if (!line.trim()) return <View key={idx} style={{ height: 6 }} />;

        const h = line.match(/^#{1,6}\s+(.*)$/);
        if (h) return <Text key={idx} style={{ color: colors.fg, fontWeight: '800', marginTop: 4, marginBottom: 2 }}>{inline(h[1])}</Text>;

        const b = line.match(/^(\s*)[-*]\s+(.*)$/);
        if (b) return (
          <View key={idx} style={{ flexDirection: 'row', gap: 6, paddingLeft: Math.min(b[1].length, 6) * 2 }}>
            <Text style={{ color: colors.primary }}>•</Text>
            <Text style={{ color, flex: 1, lineHeight: 21 }}>{inline(b[2])}</Text>
          </View>
        );

        const n = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (n) return (
          <View key={idx} style={{ flexDirection: 'row', gap: 6, paddingLeft: Math.min(n[1].length, 6) * 2 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{n[2]}.</Text>
            <Text style={{ color, flex: 1, lineHeight: 21 }}>{inline(n[3])}</Text>
          </View>
        );

        return <Text key={idx} style={{ color, lineHeight: 22 }}>{inline(line)}</Text>;
      })}
    </View>
  );
}
