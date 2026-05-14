import {Line, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP; // 540

/**
 * Scene 6 — Scaling under load.
 * Narration: "Now what if traffic spikes? One container can only do so much.
 * But hey — we already have three hosts. Why not run three copies of the
 * container, one per host, and split the work?"
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const containerA = createRef<Container>();
  const containerB = createRef<Container>();
  const containerC = createRef<Container>();
  const arrow1 = createRef<Line>();
  const arrow2 = createRef<Line>();
  const arrow3 = createRef<Line>();

  view.add(
    <>
      <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container ref={containerB} name="my-app" x={0} y={50} />
      <Container ref={containerA} name="my-app" x={-HOST_X} y={50} opacity={0} />
      <Container ref={containerC} name="my-app" x={HOST_X} y={50} opacity={0} />
      {/* Three request arrows initially clustered above container B */}
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

  yield* waitFor(0.5);

  // 1. Traffic floods in — three arrows over container B.
  yield* all(
    arrow1().opacity(1, 0.3),
    arrow1().end(1, 0.4, easeOutCubic),
    arrow2().opacity(1, 0.3),
    arrow2().end(1, 0.4, easeOutCubic),
    arrow3().opacity(1, 0.3),
    arrow3().end(1, 0.4, easeOutCubic),
  );

  // 2. Container B strains under the load.
  yield* containerB().scale(1.15, 0.3);
  yield* containerB().scale(1, 0.3);
  yield* waitFor(0.8);

  // 3. Replicas appear on A and C.
  yield* all(
    containerA().opacity(1, 0.5),
    containerC().opacity(1, 0.5),
  );
  yield* waitFor(0.3);

  // 4. Arrows redistribute — one to each container.
  yield* all(
    arrow1().position.x(-HOST_X, 0.6, easeOutCubic),
    arrow3().position.x(HOST_X, 0.6, easeOutCubic),
  );

  yield* waitFor(2);
});
