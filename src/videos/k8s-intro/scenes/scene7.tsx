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
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const client = createRef<Client>();
  const q1 = createRef<Txt>();
  const q2 = createRef<Txt>();
  const q3 = createRef<Txt>();

  view.add(
    <>
      <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container name="my-app" x={-HOST_X} y={50} />
      <Container name="my-app" x={0} y={50} />
      <Container name="my-app" x={HOST_X} y={50} />
      {/* Client off-screen left; slides in */}
      <Client ref={client} name="client" x={-1200} y={0} />
      {/* Question marks above each container */}
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
  yield* client().position.x(-870, 0.7, easeOutCubic);
  yield* waitFor(0.6);

  // 2. Three question marks bloom above the containers.
  yield* all(
    q1().opacity(1, 0.4),
    q2().opacity(1, 0.4),
    q3().opacity(1, 0.4),
  );

  yield* waitFor(2.5);
});
