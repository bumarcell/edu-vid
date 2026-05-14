import {makeScene2D, Txt} from '@motion-canvas/2d';
import {createRef, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {theme} from '@shared/theme';

/**
 * Scene 2 — The crash.
 * Narration: "…until it crashes. Maybe a bug, maybe it ran out of memory —
 * doesn't matter. It's gone."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const container = createRef<Container>();
  const caption = createRef<Txt>();

  // Start in the same position scene 1 ended — visual continuity.
  view.add(
    <>
      <Container ref={container} name="my-app" />
      <Txt
        ref={caption}
        text="a container"
        fontFamily={theme.font}
        fontSize={theme.captionSize}
        fill={theme.network}
        y={140}
      />
    </>,
  );

  yield* waitFor(0.6);
  yield* caption().opacity(0, 0.3);
  yield* container().crash();
  yield* waitFor(1.5); // beat of silence
});
