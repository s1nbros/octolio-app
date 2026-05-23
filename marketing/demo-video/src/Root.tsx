import { Composition } from 'remotion';
import { OctolioUpdate, FPS, DURATION_FRAMES, WIDTH, HEIGHT } from './DemoVideo';

export const Root = () => (
  <>
    <Composition
      id="OctolioUpdate"
      component={OctolioUpdate}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
