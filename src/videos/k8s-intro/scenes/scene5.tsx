import {Line, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, spawn, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

/**
 * Scene 5 — Multiple hosts + free scheduling.
 * Narration: "Okay, so let's add more machines. And critically — let's not
 * pin our container to any specific one. We just say 'run this thing,'
 * and *something* decides which host has room and puts it there.
 * If a host dies, that something just picks another one."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  // Three hosts side-by-side: B (left), A dead (center), C (right).
  // Same dimensions as scene 4's host so the size doesn't jump across cuts.
  const HOST_W = 480;
  const HOST_H = 420;
  const HOST_GAP = 60;
  const HOST_X = HOST_W + HOST_GAP;

  const hostA = createRef<Host>();
  const hostB = createRef<Host>();
  const hostC = createRef<Host>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const container = createRef<Container>();
  const placementArrow = createRef<Line>();

  view.add(
    <>
      {/* Host A — dead, dimmed, persists from scene 4 */}
      <Host
        ref={hostA}
        name="Host A"
        width={HOST_W}
        height={HOST_H}
        dead
      />
      {/* Dead container and watcher persist inside Host A — they died with
          the host at the end of scene 4 and remain at the same dim opacity
          here so the cut from scene 4 → 5 is visually continuous. */}
      <Container name="my-app" ip="10.244.1.34" dead x={0} y={50} opacity={0.5} />
      <Controller label="watcher" dead x={0} y={-115} opacity={0.5} />
      {/* Host B — slides in from off-screen left */}
      <Host
        ref={hostB}
        name="Host B"
        width={HOST_W}
        height={HOST_H}
        x={-HOST_X - 300}
        opacity={0}
      />
      {/* Host C — slides in from off-screen right */}
      <Host
        ref={hostC}
        name="Host C"
        width={HOST_W}
        height={HOST_H}
        x={HOST_X + 300}
        opacity={0}
      />
      {/* Watchers for the new alive hosts, sliding in alongside them. */}
      <Controller
        ref={watcherB}
        label="watcher"
        x={-HOST_X - 300}
        y={-115}
        opacity={0}
      />
      <Controller
        ref={watcherC}
        label="watcher"
        x={HOST_X + 300}
        y={-115}
        opacity={0}
      />
      {/* The new container will land on Host B */}
      <Container
        ref={container}
        name="my-app"
        ip="10.244.2.13"
        x={-HOST_X}
        y={50}
        opacity={0}
      />
      {/* Arrow pointing down at Host B — the "invisible hand" placing it */}
      <Line
        ref={placementArrow}
        points={[
          [-HOST_X, -340],
          [-HOST_X, -220],
        ]}
        stroke={theme.network}
        lineWidth={2.5}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />
    </>,
  );

  // 1. Hosts B and C slide in, watchers tagging along on each.
  yield* all(
    hostB().position.x(-HOST_X, 0.8077, easeOutCubic),
    hostB().opacity(1, 0.6923),
    hostC().position.x(HOST_X, 0.8077, easeOutCubic),
    hostC().opacity(1, 0.6923),
    watcherB().position.x(-HOST_X, 0.8077, easeOutCubic),
    watcherB().opacity(1, 0.6923),
    watcherC().position.x(HOST_X, 0.8077, easeOutCubic),
    watcherC().opacity(1, 0.6923),
  );
  spawn(watcherB().idle());
  spawn(watcherC().idle());
  yield* waitFor(1.3846);

  // 2. Arrow appears, pointing down at Host B.
  yield* all(
    placementArrow().opacity(1, 0.3462),
    placementArrow().end(1, 0.5769, easeOutCubic),
  );
  yield* waitFor(0.4615);

  // 3. Container fades in on Host B; arrow fades out.
  yield* container().opacity(1, 0.5769);
  yield* placementArrow().opacity(0, 0.4615);
  yield* waitFor(2.3077);
});
