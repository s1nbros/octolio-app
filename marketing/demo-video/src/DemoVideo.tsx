import { AbsoluteFill, Series } from 'remotion';
import { theme } from './theme';
import { Intro } from './scenes/Intro';
import { ReviewScene } from './scenes/ReviewScene';
import { ToolsScene } from './scenes/ToolsScene';
import { FriendsScene } from './scenes/FriendsScene';
import { Outro } from './scenes/Outro';

// 30s × 30fps = 900 frames total
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Scene timing (in frames @ 30 fps)
const D = {
  intro:   90,   // 3.0s — logo + "BIG UPDATE"
  review:  210,  // 7.0s — spaced repetition demo
  tools:   240,  // 8.0s — calculator carousel (3 calcs × ~2.6s each)
  friends: 240,  // 8.0s — search → add → notification
  outro:   120,  // 4.0s — CTA
};

export const DURATION_FRAMES =
  D.intro + D.review + D.tools + D.friends + D.outro; // = 900

export const OctolioUpdate: React.FC = () => (
  <AbsoluteFill style={{ background: theme.bg, fontFamily: 'Inter, sans-serif' }}>
    <Series>
      <Series.Sequence durationInFrames={D.intro}>
        <Intro />
      </Series.Sequence>

      <Series.Sequence durationInFrames={D.review}>
        <ReviewScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={D.tools}>
        <ToolsScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={D.friends}>
        <FriendsScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={D.outro}>
        <Outro />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
