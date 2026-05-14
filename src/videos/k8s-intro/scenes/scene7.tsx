import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Client} from '@shared/components/Client';
import {Container} from '@shared/components/Container';
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
 * Each container shows its (ephemeral) IP under it. When the narration
 * mentions "their IPs change", the IPs visibly cycle to new values — that
 * sets up scene 8's stable-address-vs-changing-pod-IP contrast.
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const client = createRef<Client>();
  const containerA = createRef<Container>();
  const containerB = createRef<Container>();
  const containerC = createRef<Container>();
  const q1 = createRef<Txt>();
  const q2 = createRef<Txt>();
  const q3 = createRef<Txt>();

  view.add(
    <>
      <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container ref={containerA} name="my-app" ip="10.244.1.7" x={-HOST_X} y={50} />
      <Container ref={containerB} name="my-app" ip="10.244.2.13" x={0} y={50} />
      <Container ref={containerC} name="my-app" ip="10.244.0.41" x={HOST_X} y={50} />
      <Client ref={client} name="client" x={-1200} y={-320} />
      <Txt
        ref={q1}
        text="?"
        x={-HOST_X}
        y={-110}
        fontFamily={theme.font}
        fontSize={64}
        fill={theme.network}
        opacity={0}
      />
      <Txt
        ref={q2}
        text="?"
        x={0}
        y={-110}
        fontFamily={theme.font}
        fontSize={64}
        fill={theme.network}
        opacity={0}
      />
      <Txt
        ref={q3}
        text="?"
        x={HOST_X}
        y={-110}
        fontFamily={theme.font}
        fontSize={64}
        fill={theme.network}
        opacity={0}
      />
    </>,
  );

  // 1. Client slides in from off-screen left.
  yield* client().position.x(-700, 1.05, easeOutCubic);
  yield* waitFor(0.9);

  // 2. "Their IPs change every time they get rescheduled." — IPs visibly
  //    cycle to new values, demonstrating the problem.
  yield* all(
    containerA().changeIp('10.244.1.22', 0.75),
    containerB().changeIp('10.244.2.4', 0.75),
    containerC().changeIp('10.244.0.58', 0.75),
  );
  yield* waitFor(0.6);

  // 3. "How does a client even find these copies?" — question marks bloom.
  yield* all(
    q1().opacity(1, 0.6),
    q2().opacity(1, 0.6),
    q3().opacity(1, 0.6),
  );

  yield* waitFor(3);
});
