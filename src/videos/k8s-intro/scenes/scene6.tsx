import {Circle, Line, makeScene2D, View2D} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, spawn, ThreadGenerator, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP; // 540

interface PuffSpec {
  x: number;
  size: number;
  delay: number;
  drift: number;
}

/** A single steam puff that rises, drifts sideways, expands, and fades. */
function* steamPuff(view: View2D, opts: PuffSpec): ThreadGenerator {
  if (opts.delay) yield* waitFor(opts.delay);
  const puff = new Circle({
    width: opts.size,
    height: opts.size,
    fill: 'rgba(220, 232, 242, 0.6)',
    x: opts.x,
    y: -40,
    opacity: 0,
  });
  view.add(puff);
  // Quick fade-in at the bottom, then rise WHILE fading out — by the time
  // the puff reaches its peak altitude it's already at opacity 0.
  yield* puff.opacity(0.6, 0.15);
  yield* all(
    puff.opacity(0, 0.75),
    puff.position.y(-180, 0.75),
    puff.position.x(opts.x + opts.drift, 0.75),
    puff.scale(1.7, 0.75),
  );
  puff.remove();
}

/** Quick lateral shake — sustained tremor while the container is under load. */
function* strainShake(node: Container, intensity = 5, cycles = 10): ThreadGenerator {
  const startX = node.position.x();
  for (let i = 0; i < cycles; i++) {
    const offset = i % 2 === 0 ? intensity : -intensity;
    yield* node.position.x(startX + offset, 0.05);
  }
  node.position.x(startX);
}

/** Stroke blinks red a few times, then settles back to alive cyan. */
function* redBlink(node: Container, cycles = 2): ThreadGenerator {
  for (let i = 0; i < cycles; i++) {
    yield* node.stroke(theme.containerFail, 0.18);
    yield* node.stroke(theme.container, 0.22);
  }
}

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
  const watcherA = createRef<Controller>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const containerA = createRef<Container>();
  const containerB = createRef<Container>();
  const containerC = createRef<Container>();
  const deadContainerA = createRef<Container>();
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
      <Container ref={containerB} name="my-app" ip="10.244.2.13" x={-HOST_X} y={50} />
      {/* Dead container persists inside Host A — matches scene 5's end.
          Fades out as Host A revives during the shift. */}
      <Container ref={deadContainerA} name="my-app" ip="10.244.1.34" dead x={0} y={50} opacity={0.5} />
      {/* Replicas waiting in their final positions; invisible until later. */}
      <Container ref={containerA} name="my-app" ip="10.244.1.7" x={-HOST_X} y={50} opacity={0} />
      <Container ref={containerC} name="my-app" ip="10.244.3.41" x={HOST_X} y={50} opacity={0} />
      {/* Watchers: A is dead (in the center, with Host A), B and C alive. */}
      <Controller ref={watcherA} label="watcher" dead x={0} y={-115} opacity={0.5} />
      <Controller ref={watcherB} label="watcher" x={-HOST_X} y={-115} />
      <Controller ref={watcherC} label="watcher" x={HOST_X} y={-115} />
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

  // Alive watchers spin from the start; the dead one stays frozen.
  spawn(watcherB().idle());
  spawn(watcherC().idle());

  yield* waitFor(0.4615);

  // 1. Host A revives and slides left; Host B (with container) slides into
  //    the center. The shift happens as one synchronised animation rather
  //    than as a cut. The dead watcher on A revives and shifts with it.
  //    The dead container rides along too and fades out — the cluster
  //    "cleans up" the failed pod as the host comes back online.
  yield* all(
    hostA().revive(0.7),
    hostA().position.x(-HOST_X, 1.0385, easeInOutCubic),
    hostB().position.x(0, 1.0385, easeInOutCubic),
    containerB().position.x(0, 1.0385, easeInOutCubic),
    watcherA().revive(0.7),
    watcherA().opacity(1, 0.5385),
    watcherA().position.x(-HOST_X, 1.0385, easeInOutCubic),
    watcherB().position.x(0, 1.0385, easeInOutCubic),
    deadContainerA().position.x(-HOST_X, 1.0385, easeInOutCubic),
    deadContainerA().opacity(0, 0.9231),
  );
  spawn(watcherA().idle()); // A is alive again — start its rotation
  yield* waitFor(0.4615);

  // 2. Traffic floods in — three arrows over container B.
  yield* all(
    arrow1().opacity(1, 0.3462),
    arrow1().end(1, 0.4615, easeOutCubic),
    arrow2().opacity(1, 0.3462),
    arrow2().end(1, 0.4615, easeOutCubic),
    arrow3().opacity(1, 0.3462),
    arrow3().end(1, 0.4615, easeOutCubic),
  );

  // 3. Container B strains under the load — it shakes, blinks red, and
  //    emits a diagonal plume of steam from its top-right corner.
  //    Container B sits at world (0, 50); its top-right corner is at
  //    roughly (140, -20). Puffs emerge there and drift up-and-right.
  const puffs: PuffSpec[] = [
    {x: 132, size: 22, delay: 0,    drift: 115},
    {x: 138, size: 26, delay: 0.05, drift: 120},
    {x: 134, size: 20, delay: 0.1,  drift: 110},
    {x: 140, size: 24, delay: 0.15, drift: 125},
    {x: 130, size: 23, delay: 0.2,  drift: 110},
    {x: 136, size: 21, delay: 0.25, drift: 118},
    {x: 138, size: 18, delay: 0.32, drift: 120},
    {x: 142, size: 20, delay: 0.38, drift: 122},
  ];
  for (const opts of puffs) {
    spawn(steamPuff(view, opts));
  }
  spawn(redBlink(containerB()));
  yield* strainShake(containerB());
  yield* waitFor(0.7);

  // 4. Replicas appear on A and C.
  yield* all(
    containerA().opacity(1, 0.5769),
    containerC().opacity(1, 0.5769),
  );
  yield* waitFor(0.3462);

  // 5. Arrows redistribute — one to each container.
  yield* all(
    arrow1().position.x(-HOST_X, 0.6923, easeOutCubic),
    arrow3().position.x(HOST_X, 0.6923, easeOutCubic),
  );

  yield* waitFor(2.3077);
});
