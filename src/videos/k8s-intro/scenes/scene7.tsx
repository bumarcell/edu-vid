import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, spawn, waitFor} from '@motion-canvas/core';
import {Client} from '@shared/components/Client';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP;

/**
 * Scene 7 — The routing problem.
 * Narration: "Which raises a question: how does a client even *find* these
 * copies? Their IPs change every time they get rescheduled. You don't want
 * callers to care about that."
 *
 * Each container shows its (ephemeral) IP under it. Watchers (cogs) keep
 * spinning above each container. When the narration mentions "their IPs
 * change", the IPs visibly cycle to new values, and a question mark
 * appears next to each fresh IP — "which one of these moving addresses
 * does the client target?"
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const client = createRef<Client>();
  const containerA = createRef<Container>();
  const containerB = createRef<Container>();
  const containerC = createRef<Container>();
  const watcherA = createRef<Controller>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const q1 = createRef<Txt>();
  const q2 = createRef<Txt>();
  const q3 = createRef<Txt>();

  // IPs sit at y=50+100=150 in world coords (container y=50, ipLabel y=100).
  const IP_Y = 150;
  const Q_X_OFFSET = 95; // place question mark just right of the IP text

  view.add(
    <>
      <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container ref={containerA} name="my-app" ip="10.244.1.7" x={-HOST_X} y={50} />
      <Container ref={containerB} name="my-app" ip="10.244.2.13" x={0} y={50} />
      <Container ref={containerC} name="my-app" ip="10.244.3.41" x={HOST_X} y={50} />
      <Controller ref={watcherA} label="watcher" x={-HOST_X} y={-115} />
      <Controller ref={watcherB} label="watcher" x={0} y={-115} />
      <Controller ref={watcherC} label="watcher" x={HOST_X} y={-115} />
      <Client ref={client} name="client" x={-1200} y={-320} />
      <Txt
        ref={q1}
        text="?"
        x={-HOST_X + Q_X_OFFSET}
        y={IP_Y}
        fontFamily={theme.font}
        fontSize={32}
        fill={theme.network}
        opacity={0}
      />
      <Txt
        ref={q2}
        text="?"
        x={Q_X_OFFSET}
        y={IP_Y}
        fontFamily={theme.font}
        fontSize={32}
        fill={theme.network}
        opacity={0}
      />
      <Txt
        ref={q3}
        text="?"
        x={HOST_X + Q_X_OFFSET}
        y={IP_Y}
        fontFamily={theme.font}
        fontSize={32}
        fill={theme.network}
        opacity={0}
      />
    </>,
  );

  spawn(watcherA().idle());
  spawn(watcherB().idle());
  spawn(watcherC().idle());

  // 1. Client slides in from off-screen left.
  yield* client().position.x(-700, 0.8077, easeOutCubic);
  yield* waitFor(0.6923);

  // 2. "Their IPs change every time they get rescheduled." — one pod dies
  //    as the example: its watcher reacts, the container crashes, then a
  //    fresh pod spins up with a new IP. The other two stay put.
  yield* all(
    containerB().crash(),
    watcherB().pulse(),
  );
  yield* containerB().restart('10.244.2.4');
  yield* waitFor(0.4615);

  // 3. "How does a client even find these copies?" — question marks bloom
  //    right next to each (newly-changed) IP.
  yield* all(
    q1().opacity(1, 0.4615),
    q2().opacity(1, 0.4615),
    q3().opacity(1, 0.4615),
  );

  yield* waitFor(2.3077);
});
