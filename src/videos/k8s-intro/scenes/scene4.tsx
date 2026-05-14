import {makeScene2D} from '@motion-canvas/2d';
import {all, createRef, spawn, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

/**
 * Scene 4 — The host dies.
 * Narration: "But what if it's not the container that fails — what if the
 * whole machine it's running on goes down? Power, kernel panic, someone
 * tripped over a cable. Now even your restart mechanism is gone."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const host = createRef<Host>();
  const container = createRef<Container>();
  const watcher = createRef<Controller>();

  // Host has been visible since scene 1; this scene brings it into focus
  // and kills it.
  view.add(
    <>
      <Host ref={host} name="Host A" />
      <Container ref={container} name="my-app" y={50} />
      <Controller ref={watcher} label="watcher" y={-115} />
    </>,
  );

  spawn(watcher().idle());

  yield* waitFor(1.5);

  // The whole host dies — host, container, and watcher all go dark.
  yield* all(
    host().die(),
    container().opacity(0.2, 0.6),
    watcher().opacity(0.2, 0.6),
  );
  yield* waitFor(2);
});
