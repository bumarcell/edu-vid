import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

/**
 * Scene 1 — The container.
 * Narration: "Say you have a container you want to run. For now, let's
 * abstract away where it runs — pretend it just lives somewhere, on some
 * machine. It's up. It's serving traffic. Life is good."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const host = createRef<Host>();
  const container = createRef<Container>();
  const caption = createRef<Txt>();

  view.add(
    <>
      <Host ref={host} name="Host A" opacity={0} />
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

  // 1. Container slides in from off-screen left, caption appears below.
  yield* all(
    container().position.x(0, 0.6, easeOutCubic),
    container().opacity(1, 0.5),
  );
  yield* caption().opacity(1, 0.4);
  yield* waitFor(1.5);

  // 2. "…let's abstract away where it runs — pretend it just lives somewhere,
  //    on some machine." Host fades in around the container; the container
  //    drops into its in-host position; the caption fades out.
  yield* all(
    host().opacity(1, 0.7),
    container().position.y(50, 0.7, easeOutCubic),
    caption().opacity(0, 0.4),
  );

  // 3. "It's up. It's serving traffic. Life is good." Hold.
  yield* waitFor(3);
});
