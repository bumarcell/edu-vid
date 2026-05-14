import {Line, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP; // 540

/**
 * Scene 6 — Scaling under load.
 *
 * Opens in scene 5's ending layout (Host A dead in the center, Host B on the
 * left with the container, Host C on the right). The first beat shifts the
 * hosts into alphabetical order — A revives and moves to the left while B
 * slides into the center carrying its container.
 *
 * Narration: "Now what if traffic spikes? One container can only do so much.
 * But hey — we already have three hosts. Why not run three copies of the
 * container, one per host, and split the work?"
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const hostA = createRef<Host>();
  const hostB = createRef<Host>();
  const containerA = createRef<Container>();
  const containerB = createRef<Container>();
  const containerC = createRef<Container>();
  const arrow1 = createRef<Line>();
  const arrow2 = createRef<Line>();
  const arrow3 = createRef<Line>();

  view.add(
    <>
      {/* Layout matches the END of scene 5: A dead in the center, B with
          the container on the left, C on the right. */}
      <Host ref={hostA} name="Host A" width={HOST_W} height={HOST_H} x={0} dead />
      <Host ref={hostB} name="Host B" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container ref={containerB} name="my-app" x={-HOST_X} y={50} />
      {/* Replicas waiting in their final positions; invisible until later. */}
      <Container ref={containerA} name="my-app" x={-HOST_X} y={50} opacity={0} />
      <Container ref={containerC} name="my-app" x={HOST_X} y={50} opacity={0} />
      {/* Three request arrows clustered above the center (where B will land) */}
      <Line
        ref={arrow1}
        x={-50}
        points={[[0, -370], [0, -230]]}
        stroke={theme.network}
        lineWidth={3}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />
      <Line
        ref={arrow2}
        x={0}
        points={[[0, -370], [0, -230]]}
        stroke={theme.network}
        lineWidth={3}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />
      <Line
        ref={arrow3}
        x={50}
        points={[[0, -370], [0, -230]]}
        stroke={theme.network}
        lineWidth={3}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />
    </>,
  );

  yield* waitFor(0.8);

  // 1. Host A revives and slides left; Host B (with container) slides into
  //    the center. The shift happens as one synchronised animation rather
  //    than as a cut.
  yield* all(
    hostA().revive(0.7),
    hostA().position.x(-HOST_X, 1.8, easeInOutCubic),
    hostB().position.x(0, 1.8, easeInOutCubic),
    containerB().position.x(0, 1.8, easeInOutCubic),
  );
  yield* waitFor(0.8);

  // 2. Traffic floods in — three arrows over container B.
  yield* all(
    arrow1().opacity(1, 0.6),
    arrow1().end(1, 0.8, easeOutCubic),
    arrow2().opacity(1, 0.6),
    arrow2().end(1, 0.8, easeOutCubic),
    arrow3().opacity(1, 0.6),
    arrow3().end(1, 0.8, easeOutCubic),
  );

  // 3. Container B strains under the load.
  yield* containerB().scale(1.15, 0.6);
  yield* containerB().scale(1, 0.6);
  yield* waitFor(1.6);

  // 4. Replicas appear on A and C.
  yield* all(
    containerA().opacity(1, 1),
    containerC().opacity(1, 1),
  );
  yield* waitFor(0.6);

  // 5. Arrows redistribute — one to each container.
  yield* all(
    arrow1().position.x(-HOST_X, 1.2, easeOutCubic),
    arrow3().position.x(HOST_X, 1.2, easeOutCubic),
  );

  yield* waitFor(4);
});
