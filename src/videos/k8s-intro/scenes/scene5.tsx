import {Line, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
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
      {/* The new container will land on Host B */}
      <Container
        ref={container}
        name="my-app"
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

  // 1. Hosts B and C slide in.
  yield* all(
    hostB().position.x(-HOST_X, 1.4, easeOutCubic),
    hostB().opacity(1, 1.2),
    hostC().position.x(HOST_X, 1.4, easeOutCubic),
    hostC().opacity(1, 1.2),
  );
  yield* waitFor(2.4);

  // 2. Arrow appears, pointing down at Host B.
  yield* all(
    placementArrow().opacity(1, 0.6),
    placementArrow().end(1, 1, easeOutCubic),
  );
  yield* waitFor(0.8);

  // 3. Container fades in on Host B; arrow fades out.
  yield* container().opacity(1, 1);
  yield* placementArrow().opacity(0, 0.8);
  yield* waitFor(4);
});
