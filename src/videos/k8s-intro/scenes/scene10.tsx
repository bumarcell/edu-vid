import {Layout, Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, spawn, waitFor} from '@motion-canvas/core';
import {Client} from '@shared/components/Client';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
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
 * Opens in Scene 9's final state. Beat 1 dismisses the reveal scaffolding
 * (frame, title, client, service, all arrows) and zooms the stage back to
 * full size. Beat 2 lands the "Worker Node" callout. Beat 3 renames the
 * cog on each host from "watcher" to "kubelet" — the cog *is* the kubelet.
 * Beat 4 draws heartbeats upward from each cog, off-screen, setting up the
 * control plane in Scene 11.
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
  const watcherA = createRef<Controller>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const svcToA = createRef<Line>();
  const svcToB = createRef<Line>();
  const svcToC = createRef<Line>();
  const clientToService = createRef<Line>();
  const heartbeatA = createRef<Line>();
  const heartbeatB = createRef<Line>();
  const heartbeatC = createRef<Line>();

  view.add(
    <>
      <Layout ref={stage} scale={0.82}>
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={-HOST_X} />
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={0} />
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={HOST_X} />
        <Container name="my-app" ip="10.244.1.22" x={-HOST_X} y={50} />
        <Container name="my-app" ip="10.244.2.4" x={0} y={50} />
        <Container name="my-app" ip="10.244.0.58" x={HOST_X} y={50} />
        {/* The cog on each host — currently labeled "watcher" from scene 9.
            Beat 3 renames each one to "kubelet". */}
        <Controller ref={watcherA} label="watcher" x={-HOST_X} y={-115} />
        <Controller ref={watcherB} label="watcher" x={0} y={-115} />
        <Controller ref={watcherC} label="watcher" x={HOST_X} y={-115} />
        <KubeProxy label="kube-proxy" x={-HOST_X} y={170} />
        <KubeProxy label="kube-proxy" x={0} y={170} />
        <KubeProxy label="kube-proxy" x={HOST_X} y={170} />
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
        {/* Heartbeats originate just above each cog (the kubelet) and head
            off-screen above. */}
        <Line
          ref={heartbeatA}
          points={[[-HOST_X, -160], [-HOST_X, -440]]}
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
          points={[[0, -160], [0, -440]]}
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
          points={[[HOST_X, -160], [HOST_X, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0}
          end={0}
        />
      </Layout>
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

  yield* waitFor(0.4615);

  // Beat 1 — fade out the reveal scaffolding and zoom back to full size.
  yield* all(
    title().opacity(0, 0.5385),
    frame().opacity(0, 0.5385),
    frame().shadowBlur(0, 0.5385),
    client().opacity(0, 0.5385),
    service().opacity(0, 0.5385),
    svcToA().opacity(0, 0.5385),
    svcToB().opacity(0, 0.5385),
    svcToC().opacity(0, 0.5385),
    clientToService().opacity(0, 0.5385),
    stage().scale(1, 0.8462, easeInOutCubic),
  );
  yield* waitFor(0.3462);

  // Beat 2 — the cog on each host gets its real name: kubelet.
  yield* all(
    watcherA().renameTo('kubelet', 0.5769),
    watcherB().renameTo('kubelet', 0.5769),
    watcherC().renameTo('kubelet', 0.5769),
  );
  yield* waitFor(0.4615);

  // Beat 3 — heartbeats from each kubelet head upward off-screen.
  yield* all(
    heartbeatA().opacity(0.6, 0.3077),
    heartbeatA().end(1, 0.5769, easeOutCubic),
    heartbeatB().opacity(0.6, 0.3077),
    heartbeatB().end(1, 0.5769, easeOutCubic),
    heartbeatC().opacity(0.6, 0.3077),
    heartbeatC().end(1, 0.5769, easeOutCubic),
  );

  yield* waitFor(2.3077);
});
