import {Line, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, waitFor} from '@motion-canvas/core';
import {Client} from '@shared/components/Client';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {KubeProxy} from '@shared/components/KubeProxy';
import {Service} from '@shared/components/Service';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP;

/**
 * Scene 8 — A stable address with on-host routers (the names "Service" and
 * "kube-proxy" are deferred until the reveal in scene 9).
 * Narration: "So we introduce a stable address — one that always points at
 * whatever copies are currently healthy. On every host, a little router
 * programs the network so traffic to that stable address ends up at a live
 * container. The client doesn't know or care which one."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const service = createRef<Service>();
  const proxyA = createRef<KubeProxy>();
  const proxyB = createRef<KubeProxy>();
  const proxyC = createRef<KubeProxy>();
  const clientToService = createRef<Line>();
  const svcToA = createRef<Line>();
  const svcToB = createRef<Line>();
  const svcToC = createRef<Line>();

  view.add(
    <>
      <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
      <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
      <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
      <Container name="my-app" ip="10.244.1.22" x={-HOST_X} y={50} />
      <Container name="my-app" ip="10.244.2.4" x={0} y={50} />
      <Container name="my-app" ip="10.244.0.58" x={HOST_X} y={50} />
      <Client name="client" x={-700} y={-320} />

      {/* The stable address (friendly name pre-reveal). */}
      <Service ref={service} name="stable address" x={0} y={-320} opacity={0} />

      {/* Per-host router (friendly name pre-reveal). */}
      <KubeProxy ref={proxyA} label="router" x={-HOST_X} y={170} opacity={0} />
      <KubeProxy ref={proxyB} label="router" x={0} y={170} opacity={0} />
      <KubeProxy ref={proxyC} label="router" x={HOST_X} y={170} opacity={0} />

      <Line
        ref={clientToService}
        points={[[-605, -320], [-180, -320]]}
        stroke={theme.network}
        lineWidth={2.5}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />

      <Line
        ref={svcToA}
        points={[[0, -280], [-HOST_X, -20]]}
        stroke={theme.service}
        lineWidth={2}
        lineDash={[8, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={svcToB}
        points={[[0, -280], [0, -20]]}
        stroke={theme.service}
        lineWidth={2}
        lineDash={[8, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={svcToC}
        points={[[0, -280], [HOST_X, -20]]}
        stroke={theme.service}
        lineWidth={2}
        lineDash={[8, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
    </>,
  );

  yield* waitFor(0.6);

  // 1. The stable address appears above the hosts.
  yield* service().opacity(1, 0.75);
  yield* waitFor(0.75);

  // 2. Routing fan-out — dashed lines from the address to each container.
  yield* all(
    svcToA().opacity(0.8, 0.45),
    svcToA().end(1, 0.75, easeOutCubic),
    svcToB().opacity(0.8, 0.45),
    svcToB().end(1, 0.75, easeOutCubic),
    svcToC().opacity(0.8, 0.45),
    svcToC().end(1, 0.75, easeOutCubic),
  );
  yield* waitFor(0.75);

  // 3. The on-host routers light up.
  yield* all(
    proxyA().opacity(1, 0.6),
    proxyB().opacity(1, 0.6),
    proxyC().opacity(1, 0.6),
  );
  yield* waitFor(0.9);

  // 4. Client sends traffic toward the address.
  yield* all(
    clientToService().opacity(1, 0.45),
    clientToService().end(1, 0.75, easeOutCubic),
  );

  yield* waitFor(3);
});
