import {makeScene2D} from '@motion-canvas/2d';
import {createRef, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

/**
 * Scene 2 — The crash.
 * Narration: "…until it crashes. Maybe a bug, maybe it ran out of memory —
 * doesn't matter. It's gone."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const container = createRef<Container>();

  // Host carries over visually from scene 1 — same dimensions and position.
  view.add(
    <>
      <Host name="Host A" />
      <Container ref={container} name="my-app" ip="10.244.1.7" y={50} />
    </>,
  );

  yield* waitFor(0.6923);
  yield* container().crash();
  yield* waitFor(1.7308);
});
