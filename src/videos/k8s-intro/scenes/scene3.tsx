import {makeScene2D, Line} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {theme} from '@shared/theme';

/**
 * Scene 3 — The restart mechanism.
 * Narration: "So the first thing you'd want is something *watching* your
 * container — and the moment it dies, bringing it back up."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const container = createRef<Container>();
  const controller = createRef<Controller>();
  const watchLine = createRef<Line>();

  view.add(
    <>
      <Container ref={container} name="my-app" />
      <Controller
        ref={controller}
        label="watcher"
        y={-220}
        opacity={0}
      />
      <Line
        ref={watchLine}
        points={[
          [0, -188],
          [0, -70],
        ]}
        stroke={theme.controlPlane}
        lineWidth={1.5}
        lineDash={[6, 6]}
        opacity={0}
        end={0}
      />
    </>,
  );

  // 1. Controller appears, draws a dashed "watching" line to the container.
  yield* controller().opacity(1, 0.4);
  yield* all(
    watchLine().opacity(0.6, 0.3),
    watchLine().end(1, 0.5, easeOutCubic),
  );
  yield* waitFor(0.8);

  // 2. Container crashes — controller pulses, then container respawns.
  yield* container().crash();
  yield* controller().pulse();
  yield* waitFor(0.3);
  yield* container().restart();
  yield* waitFor(0.8);

  // 3. Loop once more so the viewer sees it's automatic.
  yield* container().crash();
  yield* controller().pulse();
  yield* container().restart();
  yield* waitFor(1.5);
});
