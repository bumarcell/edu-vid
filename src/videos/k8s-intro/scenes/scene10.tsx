import {Layout, Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, spawn, waitFor} from '@motion-canvas/core';
import {Client} from '@shared/components/Client';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {Kubelet} from '@shared/components/Kubelet';
import {KubeProxy} from '@shared/components/KubeProxy';
import {Service} from '@shared/components/Service';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP;

/**
 * Scene 10 — Naming the pieces (worker side).
 *
 * Opens in Scene 9's final state (frame, title, full system at 0.82 scale).
 * Beat 1 dismisses the reveal scaffolding — title, frame, client, service,
 * fan-out arrows — and zooms back in to full size. Beat 2 lands a
 * "Worker Node" callout. Beat 3 introduces kubelet on every host (with the
 * existing kube-proxies sliding right to make room). Beat 4 sends heartbeat
 * arrows up off-screen, setting up the control plane in scene 11.
 *
 * Narration: "Each host is a worker node. On every worker runs a kubelet —
 * it's the thing that actually starts your containers, watches them, and
 * reports their status back up the chain. Next to it, the kube-proxy we
 * already met, handling the network."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const stage = createRef<Layout>();
  const frame = createRef<Rect>();
  const title = createRef<Txt>();
  const client = createRef<Client>();
  const service = createRef<Service>();
  const proxyA = createRef<KubeProxy>();
  const proxyB = createRef<KubeProxy>();
  const proxyC = createRef<KubeProxy>();
  const watcherA = createRef<Controller>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const svcToA = createRef<Line>();
  const svcToB = createRef<Line>();
  const svcToC = createRef<Line>();
  const clientToService = createRef<Line>();
  const workerNodeLabel = createRef<Txt>();
  const kubeletA = createRef<Kubelet>();
  const kubeletB = createRef<Kubelet>();
  const kubeletC = createRef<Kubelet>();
  const heartbeatA = createRef<Line>();
  const heartbeatB = createRef<Line>();
  const heartbeatC = createRef<Line>();

  // Final positions for kubelet + kube-proxy inside each host — symmetric
  // around the host center, both at y=170.
  const proxyOffset = 90;
  const kubeletOffset = -90;

  view.add(
    <>
      <Layout ref={stage} scale={0.82}>
        <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
        <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
        <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
        <Container name="my-app" ip="10.244.1.22" x={-HOST_X} y={50} />
        <Container name="my-app" ip="10.244.2.4" x={0} y={50} />
        <Container name="my-app" ip="10.244.0.58" x={HOST_X} y={50} />
        <Controller ref={watcherA} label="watcher" x={-HOST_X} y={-115} />
        <Controller ref={watcherB} label="watcher" x={0} y={-115} />
        <Controller ref={watcherC} label="watcher" x={HOST_X} y={-115} />
        {/* kube-proxies open where they sat at the end of scene 9 — host
            center — and slide right in beat 3 to make room for kubelets. */}
        <KubeProxy ref={proxyA} label="kube-proxy" x={-HOST_X} y={170} />
        <KubeProxy ref={proxyB} label="kube-proxy" x={0} y={170} />
        <KubeProxy ref={proxyC} label="kube-proxy" x={HOST_X} y={170} />
        <Client ref={client} name="client" x={-700} y={-320} />
        <Service ref={service} name="Service" x={0} y={-320} />
        <Line
          ref={svcToA}
          points={[[0, -280], [-HOST_X, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          ref={svcToB}
          points={[[0, -280], [0, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          ref={svcToC}
          points={[[0, -280], [HOST_X, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          ref={clientToService}
          points={[[-605, -320], [-180, -320]]}
          stroke={theme.network}
          lineWidth={2.5}
          endArrow
          arrowSize={12}
        />
        {/* Scene-10 additions — hidden until their beats. */}
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
        <Kubelet ref={kubeletA} x={-HOST_X + kubeletOffset} y={170} opacity={0} />
        <Kubelet ref={kubeletB} x={kubeletOffset} y={170} opacity={0} />
        <Kubelet ref={kubeletC} x={HOST_X + kubeletOffset} y={170} opacity={0} />
        <Line
          ref={heartbeatA}
          points={[[-HOST_X + kubeletOffset, 140], [-HOST_X + kubeletOffset, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0}
          end={0}
        />
        <Line
          ref={heartbeatB}
          points={[[kubeletOffset, 140], [kubeletOffset, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0}
          end={0}
        />
        <Line
          ref={heartbeatC}
          points={[[HOST_X + kubeletOffset, 140], [HOST_X + kubeletOffset, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0}
          end={0}
        />
      </Layout>
      {/* Frame and title — present at the start to match scene 9's ending. */}
      <Rect
        ref={frame}
        width={1820}
        height={920}
        radius={36}
        stroke={theme.highlight}
        lineWidth={4}
        shadowColor={theme.highlight}
        shadowBlur={40}
        opacity={0.9}
      />
      <Txt
        ref={title}
        text="Kubernetes"
        y={-470}
        fontFamily={theme.font}
        fontSize={56}
        fill={theme.highlight}
      />
    </>,
  );

  spawn(watcherA().idle());
  spawn(watcherB().idle());
  spawn(watcherC().idle());

  yield* waitFor(0.6);

  // Beat 1 — fade out the reveal scaffolding and zoom back to full size.
  yield* all(
    title().opacity(0, 0.7),
    frame().opacity(0, 0.7),
    frame().shadowBlur(0, 0.7),
    client().opacity(0, 0.7),
    service().opacity(0, 0.7),
    svcToA().opacity(0, 0.7),
    svcToB().opacity(0, 0.7),
    svcToC().opacity(0, 0.7),
    clientToService().opacity(0, 0.7),
    stage().scale(1, 1.1, easeInOutCubic),
  );
  yield* waitFor(0.45);

  // Beat 2 — "Worker Node" callout lands over the middle host.
  yield* workerNodeLabel().opacity(1, 0.6);
  yield* waitFor(0.6);

  // Beat 3 — kube-proxies slide right; kubelets fade in on every host.
  yield* all(
    proxyA().position.x(-HOST_X + proxyOffset, 0.6, easeInOutCubic),
    proxyB().position.x(proxyOffset, 0.6, easeInOutCubic),
    proxyC().position.x(HOST_X + proxyOffset, 0.6, easeInOutCubic),
    kubeletA().opacity(1, 0.5),
    kubeletB().opacity(1, 0.5),
    kubeletC().opacity(1, 0.5),
  );
  yield* waitFor(0.6);

  // Beat 4 — heartbeat arrows from each kubelet head upward off-screen.
  yield* all(
    heartbeatA().opacity(0.6, 0.4),
    heartbeatA().end(1, 0.75, easeOutCubic),
    heartbeatB().opacity(0.6, 0.4),
    heartbeatB().end(1, 0.75, easeOutCubic),
    heartbeatC().opacity(0.6, 0.4),
    heartbeatC().end(1, 0.75, easeOutCubic),
  );

  yield* waitFor(3);
});
