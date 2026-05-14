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
 * Scene 8 — kube-proxy + Service.
 * Narration: "So we introduce a stable address — a Service — that always
 * points at whatever copies are currently healthy. On every host, a little
 * component called kube-proxy programs the network so that traffic to the
 * Service gets routed to a live container."
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
      <Container name="my-app" x={-HOST_X} y={50} />
      <Container name="my-app" x={0} y={50} />
      <Container name="my-app" x={HOST_X} y={50} />
      <Client name="client" x={-870} y={0} />

      {/* Service sits above the three hosts */}
      <Service ref={service} x={0} y={-320} opacity={0} />

      {/* kube-proxy on each host, near the bottom-center */}
      <KubeProxy ref={proxyA} x={-HOST_X} y={170} opacity={0} />
      <KubeProxy ref={proxyB} x={0} y={170} opacity={0} />
      <KubeProxy ref={proxyC} x={HOST_X} y={170} opacity={0} />

      {/* Client → Service */}
      <Line
        ref={clientToService}
        points={[[-780, 0], [-180, -320]]}
        stroke={theme.network}
        lineWidth={2.5}
        endArrow
        arrowSize={12}
        opacity={0}
        end={0}
      />

      {/* Service → each container, fanning out */}
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

  yield* waitFor(0.4);

  // 1. Service fades in above the hosts.
  yield* service().opacity(1, 0.5);
  yield* waitFor(0.5);

  // 2. Service routes — dashed lines fan out from Service to each container.
  yield* all(
    svcToA().opacity(0.8, 0.3),
    svcToA().end(1, 0.5, easeOutCubic),
    svcToB().opacity(0.8, 0.3),
    svcToB().end(1, 0.5, easeOutCubic),
    svcToC().opacity(0.8, 0.3),
    svcToC().end(1, 0.5, easeOutCubic),
  );
  yield* waitFor(0.5);

  // 3. kube-proxy lights up on every host.
  yield* all(
    proxyA().opacity(1, 0.4),
    proxyB().opacity(1, 0.4),
    proxyC().opacity(1, 0.4),
  );
  yield* waitFor(0.6);

  // 4. Client sends traffic toward the Service.
  yield* all(
    clientToService().opacity(1, 0.3),
    clientToService().end(1, 0.5, easeOutCubic),
  );

  yield* waitFor(2);
});
