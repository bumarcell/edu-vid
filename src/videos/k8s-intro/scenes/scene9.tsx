import {Layout, Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, waitFor} from '@motion-canvas/core';
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

const TITLE_BIG = 140;
const TITLE_SMALL = 56;
const TITLE_RESTING_Y = -470;

/**
 * Scene 9 — The reveal.
 * Narration: "And… congratulations. You've just re-invented Kubernetes.
 * Everything we just built has a name."
 *
 * Beats:
 *   1. Hold on the full system.
 *   2. Stage settles smaller.
 *   3. Title lands huge over the center (recognition moment).
 *   4. Title settles up; frame materializes; glow expands.
 *   5. Components get their real K8s names — "stable address" → "Service"
 *      (with a self-aware aside), "router" → "kube-proxy".
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const stage = createRef<Layout>();
  const frame = createRef<Rect>();
  const title = createRef<Txt>();
  const service = createRef<Service>();
  const proxyA = createRef<KubeProxy>();
  const proxyB = createRef<KubeProxy>();
  const proxyC = createRef<KubeProxy>();
  const serviceAside = createRef<Txt>();

  view.add(
    <>
      <Layout ref={stage}>
        <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
        <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
        <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
        <Container name="my-app" ip="10.244.1.22" x={-HOST_X} y={50} />
        <Container name="my-app" ip="10.244.2.4" x={0} y={50} />
        <Container name="my-app" ip="10.244.0.58" x={HOST_X} y={50} />
        <Client name="client" x={-700} y={-320} />
        {/* Start with the friendly names from scene 8. */}
        <Service ref={service} name="stable address" x={0} y={-320} />
        <KubeProxy ref={proxyA} label="router" x={-HOST_X} y={170} />
        <KubeProxy ref={proxyB} label="router" x={0} y={170} />
        <KubeProxy ref={proxyC} label="router" x={HOST_X} y={170} />
        <Txt
          ref={serviceAside}
          text="(unfortunate name, we know)"
          x={0}
          y={-395}
          fontFamily={theme.font}
          fontSize={18}
          fill={theme.network}
          opacity={0}
        />
        <Line
          points={[[0, -280], [-HOST_X, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          points={[[0, -280], [0, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          points={[[0, -280], [HOST_X, -20]]}
          stroke={theme.service}
          lineWidth={2}
          lineDash={[8, 6]}
          endArrow
          arrowSize={10}
          opacity={0.8}
        />
        <Line
          points={[[-605, -320], [-180, -320]]}
          stroke={theme.network}
          lineWidth={2.5}
          endArrow
          arrowSize={12}
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
        shadowBlur={0}
        opacity={0}
        scale={0.96}
      />
      <Txt
        ref={title}
        text="Kubernetes"
        y={0}
        fontFamily={theme.font}
        fontSize={TITLE_BIG}
        fill={theme.highlight}
        opacity={0}
        scale={0.85}
      />
    </>,
  );

  // 1. Hold on the full system.
  yield* waitFor(1.2);

  // 2. Stage settles smaller to make room for the frame.
  yield* stage().scale(0.82, 1.5, easeInOutCubic);
  yield* waitFor(0.45);

  // 3. Title lands huge over the center — the recognition moment.
  yield* all(
    title().opacity(1, 0.75, easeOutCubic),
    title().scale(1, 1.05, easeOutCubic),
  );
  yield* waitFor(1.65);

  // 4. Title settles up; frame materializes with expanding glow.
  yield* all(
    title().position.y(TITLE_RESTING_Y, 1.35, easeInOutCubic),
    title().fontSize(TITLE_SMALL, 1.35, easeInOutCubic),
    frame().opacity(0.9, 1.05, easeOutCubic),
    frame().scale(1, 1.35, easeOutCubic),
    frame().shadowBlur(40, 1.5, easeOutCubic),
  );
  yield* waitFor(1.2);

  // 5. "Everything we just built has a name." Rename the friendly labels.
  yield* service().renameTo('Service', 0.9);
  yield* serviceAside().opacity(0.75, 0.6);
  yield* waitFor(1.2);
  yield* all(
    proxyA().renameTo('kube-proxy', 0.75),
    proxyB().renameTo('kube-proxy', 0.75),
    proxyC().renameTo('kube-proxy', 0.75),
  );

  yield* waitFor(3.75);
});
