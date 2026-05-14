import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {theme} from '@shared/theme';

/**
 * Scene 1 — The container.
 * Narration: "Say you have a container you want to run..."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const container = createRef<Container>();
  const caption = createRef<Txt>();

  view.add(
    <>
      <Container ref={container} name="my-app" x={-400} opacity={0} />
      <Txt
        ref={caption}
        text="a container"
        fontFamily={theme.font}
        fontSize={theme.captionSize}
        fill={theme.network}
        y={140}
        opacity={0}
      />
    </>,
  );

  yield* all(
    container().position.x(0, 0.6, easeOutCubic),
    container().opacity(1, 0.5),
  );
  yield* caption().opacity(1, 0.4);
  yield* waitFor(2);
});
