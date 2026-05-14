import {Line, makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {Kubelet} from '@shared/components/Kubelet';
import {KubeProxy} from '@shared/components/KubeProxy';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP;

/**
 * Scene 10 — Naming the pieces (worker side).
 * Narration: "Each host is a worker node. On every worker runs a kubelet —
 * it's the thing that actually starts your containers, watches them, and
 * reports their status back up the chain. Next to it, the kube-proxy we
 * already met, handling the network."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const hostA = createRef<Host>();
  const hostB = createRef<Host>();
  const hostC = createRef<Host>();
  const workerNodeLabel = createRef<Txt>();
  const kubelet = createRef<Kubelet>();
  const heartbeat = createRef<Line>();

  view.add(
    <>
      <Host ref={hostA} name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} opacity={0.3} />
      <Host ref={hostB} name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host ref={hostC} name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} opacity={0.3} />

      <Container name="my-app" x={-HOST_X} y={50} opacity={0.3} />
      <Container name="my-app" x={0} y={50} />
      <Container name="my-app" x={HOST_X} y={50} opacity={0.3} />

      <KubeProxy x={-HOST_X} y={170} opacity={0.3} />
      <KubeProxy x={0} y={170} />
      <KubeProxy x={HOST_X} y={170} opacity={0.3} />

      {/* "Worker Node" callout above host B */}
      <Txt
        ref={workerNodeLabel}
        text="Worker Node"
        x={0}
        y={-280}
        fontFamily={theme.font}
        fontSize={36}
        fill={theme.host}
        opacity={0}
      />

      {/* kubelet appears in host B, opposite corner from kube-proxy */}
      <Kubelet ref={kubelet} x={-180} y={170} opacity={0} />

      {/* Heartbeat arrow upward from kubelet, off-screen */}
      <Line
        ref={heartbeat}
        points={[[-180, 140], [-180, -260]]}
        stroke={theme.host}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
    </>,
  );

  yield* waitFor(0.5);

  // 1. "Worker Node" label appears above the focused host.
  yield* workerNodeLabel().opacity(1, 0.5);
  yield* waitFor(0.6);

  // 2. kubelet appears.
  yield* kubelet().opacity(1, 0.5);
  yield* waitFor(0.5);

  // 3. Heartbeat arrow goes upward — kubelet reports up the chain.
  yield* all(
    heartbeat().opacity(0.6, 0.3),
    heartbeat().end(1, 0.6, easeOutCubic),
  );

  yield* waitFor(2);
});
