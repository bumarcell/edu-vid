import {makeScene2D, Line} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, spawn, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
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

  // Host and container carry over visually from scene 1/2. The watcher is
  // new in this scene, appearing INSIDE the host above the container.
  view.add(
    <>
      <Host name="Host A" />
      <Container ref={container} name="my-app" y={50} />
      <Controller ref={controller} label="watcher" y={-115} opacity={0} />
      <Line
        ref={watchLine}
        points={[
          [0, -80],
          [0, -20],
        ]}
        stroke={theme.controlPlane}
        lineWidth={1.5}
        lineDash={[6, 6]}
        opacity={0}
        end={0}
      />
    </>,
  );

  // 1. Watcher appears inside the host, dashed leader line to the container.
  yield* controller().opacity(1, 0.4);
  spawn(controller().idle());
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
