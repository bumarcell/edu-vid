import {Layout, Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
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
 * Scene 9 — The reveal.
 * Narration: "And… congratulations. You've just re-invented Kubernetes.
 * Everything we just built has a name."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const stage = createRef<Layout>();
  const frame = createRef<Rect>();
  const title = createRef<Txt>();

  view.add(
    <>
      <Layout ref={stage}>
        <Host name="Host A" width={HOST_W} height={HOST_H} x={-HOST_X} />
        <Host name="Host B" width={HOST_W} height={HOST_H} x={0} />
        <Host name="Host C" width={HOST_W} height={HOST_H} x={HOST_X} />
        <Container name="my-app" x={-HOST_X} y={50} />
        <Container name="my-app" x={0} y={50} />
        <Container name="my-app" x={HOST_X} y={50} />
        <Client name="client" x={-870} y={0} />
        <Service x={0} y={-320} />
        <KubeProxy x={-HOST_X} y={170} />
        <KubeProxy x={0} y={170} />
        <KubeProxy x={HOST_X} y={170} />
        {/* Service → containers (kept from scene 8) */}
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
          points={[[-780, 0], [-180, -320]]}
          stroke={theme.network}
          lineWidth={2.5}
          endArrow
          arrowSize={12}
        />
      </Layout>
      {/* The outer glowing frame — appears when we reveal "this is Kubernetes" */}
      <Rect
        ref={frame}
        width={1820}
        height={920}
        radius={36}
        stroke={theme.highlight}
        lineWidth={4}
        shadowColor={theme.highlight}
        shadowBlur={40}
        opacity={0}
      />
      <Txt
        ref={title}
        text="Kubernetes"
        y={-470}
        fontFamily={theme.font}
        fontSize={56}
        fill={theme.highlight}
        opacity={0}
      />
    </>,
  );

  // 1. Brief hold on the full system.
  yield* waitFor(0.6);

  // 2. Pull back: scale the stage down to fit inside the new frame.
  yield* stage().scale(0.82, 0.8, easeOutCubic);

  // 3. The frame fades in around everything.
  yield* frame().opacity(0.9, 0.7);

  // 4. The title drops in.
  yield* title().opacity(1, 0.6);
  yield* waitFor(2.5);
});
