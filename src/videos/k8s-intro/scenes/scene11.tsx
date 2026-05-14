import {Circle, Layout, Line, makeScene2D, Polygon, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, linear, loop, sequence, spawn, ThreadGenerator, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Controller} from '@shared/components/Controller';
import {Host} from '@shared/components/Host';
import {KubeProxy} from '@shared/components/KubeProxy';
import {theme} from '@shared/theme';

const HOST_W = 480;
const HOST_H = 420;
const HOST_GAP = 60;
const HOST_X = HOST_W + HOST_GAP;

const STAGE_TARGET_SCALE = 0.7;
const STAGE_TARGET_Y = 320;

const CP_Y = -240;
const CP_REGION_TOP = -360;
const CP_REGION_BOTTOM = -120;
const APISERVER_X = -260;
const APISERVER_BOTTOM_Y = -145;

// Cog (kubelet) stage-local position is (host_x, -115). After the stage
// scales to 0.7 and shifts to y=320, find its world position and offset
// up by enough to clear the cog visual.
const cogWorld = (stageX: number) => ({
  x: stageX * STAGE_TARGET_SCALE,
  y: STAGE_TARGET_Y + -115 * STAGE_TARGET_SCALE,
});
const heartbeatStart = (stageX: number): [number, number] => {
  const c = cogWorld(stageX);
  // 32 (gear extent) + small gap, scaled by stage scale.
  const offset = 36 * STAGE_TARGET_SCALE;
  return [c.x, c.y - offset];
};

/**
 * Continuous flowing-dash animation on a dashed line — suggests data
 * traveling along the connection. Run as a background task via spawn().
 */
function* flowDashes(line: Line, period = 1.5): ThreadGenerator {
  yield* loop(Infinity, function* () {
    yield* line.lineDashOffset(line.lineDashOffset() - 12, period, linear);
  });
}

/**
 * Scene 11 — The control plane.
 *
 * Opens in Scene 10's end state. Stage scales down and shifts to the bottom
 * half. Control plane lights up at the top. New dashed arrows fan up from
 * each kubelet (cog) to the apiserver.
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const stage = createRef<Layout>();
  const watcherA = createRef<Controller>();
  const watcherB = createRef<Controller>();
  const watcherC = createRef<Controller>();
  const oldHbA = createRef<Line>();
  const oldHbB = createRef<Line>();
  const oldHbC = createRef<Line>();

  const cpRegion = createRef<Rect>();
  const cpLabel = createRef<Txt>();
  const apiserver = createRef<Polygon>();
  const apiserverLabel = createRef<Txt>();
  const etcd = createRef<Rect>();
  const etcdLabel = createRef<Txt>();
  const scheduler = createRef<Rect>();
  const schedulerLabel = createRef<Txt>();
  const cmRect = createRef<Rect>();
  const cmLabel = createRef<Txt>();
  const cmCtrl1 = createRef<Circle>();
  const cmCtrl2 = createRef<Circle>();
  const cmCtrl3 = createRef<Circle>();

  const newHbA = createRef<Line>();
  const newHbB = createRef<Line>();
  const newHbC = createRef<Line>();

  // Hub-spoke links between apiserver and each other CP component.
  const linkEtcd = createRef<Line>();
  const linkScheduler = createRef<Line>();
  const linkCm = createRef<Line>();

  const closingFrame = createRef<Rect>();

  const apiserverTarget: [number, number] = [APISERVER_X, APISERVER_BOTTOM_Y];

  view.add(
    <>
      <Layout ref={stage}>
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={-HOST_X} />
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={0} />
        <Host name="Worker Node" width={HOST_W} height={HOST_H} x={HOST_X} />
        <Container name="my-app" ip="10.244.1.22" x={-HOST_X} y={50} />
        <Container name="my-app" ip="10.244.2.4" x={0} y={50} />
        <Container name="my-app" ip="10.244.0.58" x={HOST_X} y={50} />
        {/* Cogs already labeled "kubelet" from the end of scene 10. */}
        <Controller ref={watcherA} label="kubelet" x={-HOST_X} y={-115} />
        <Controller ref={watcherB} label="kubelet" x={0} y={-115} />
        <Controller ref={watcherC} label="kubelet" x={HOST_X} y={-115} />
        <KubeProxy label="kube-proxy" x={-HOST_X} y={170} />
        <KubeProxy label="kube-proxy" x={0} y={170} />
        <KubeProxy label="kube-proxy" x={HOST_X} y={170} />
        {/* Short heartbeats from above each cog — fade during the pull-back. */}
        <Line
          ref={oldHbA}
          points={[[-HOST_X, -160], [-HOST_X, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0.6}
        />
        <Line
          ref={oldHbB}
          points={[[0, -160], [0, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0.6}
        />
        <Line
          ref={oldHbC}
          points={[[HOST_X, -160], [HOST_X, -440]]}
          stroke={theme.host}
          lineWidth={2}
          lineDash={[6, 6]}
          endArrow
          arrowSize={10}
          opacity={0.6}
        />
      </Layout>

      <Rect
        ref={cpRegion}
        x={0}
        y={(CP_REGION_TOP + CP_REGION_BOTTOM) / 2}
        width={1740}
        height={CP_REGION_BOTTOM - CP_REGION_TOP}
        radius={20}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[10, 6]}
        fill={theme.controlPlaneFill}
        opacity={0}
      />
      <Txt
        ref={cpLabel}
        text="Control Plane"
        x={-770}
        y={CP_REGION_TOP - 30}
        fontFamily={theme.font}
        fontSize={26}
        fill={theme.controlPlane}
        textAlign="left"
        offset={[-1, 0]}
        opacity={0}
      />

      <Rect
        ref={etcd}
        x={-660}
        y={CP_Y}
        width={130}
        height={180}
        radius={30}
        stroke={theme.controlPlane}
        lineWidth={3}
        fill={theme.controlPlaneFill}
        opacity={0}
      />
      <Txt
        ref={etcdLabel}
        text="etcd"
        x={-660}
        y={CP_Y}
        fontFamily={theme.font}
        fontSize={22}
        fill={theme.controlPlane}
        opacity={0}
      />

      <Polygon
        ref={apiserver}
        sides={6}
        x={APISERVER_X}
        y={CP_Y}
        width={190}
        height={190}
        stroke={theme.controlPlane}
        lineWidth={3}
        fill={theme.controlPlaneFill}
        opacity={0}
      />
      <Txt
        ref={apiserverLabel}
        text={'kube-\napiserver'}
        x={APISERVER_X}
        y={CP_Y}
        fontFamily={theme.font}
        fontSize={20}
        fill={theme.controlPlane}
        textAlign="center"
        opacity={0}
      />

      <Rect
        ref={scheduler}
        x={170}
        y={CP_Y}
        width={230}
        height={140}
        radius={12}
        stroke={theme.controlPlane}
        lineWidth={3}
        fill={theme.controlPlaneFill}
        opacity={0}
      />
      <Txt
        ref={schedulerLabel}
        text="kube-scheduler"
        x={170}
        y={CP_Y}
        fontFamily={theme.font}
        fontSize={20}
        fill={theme.controlPlane}
        opacity={0}
      />

      <Rect
        ref={cmRect}
        x={620}
        y={CP_Y}
        width={290}
        height={180}
        radius={12}
        stroke={theme.controlPlane}
        lineWidth={3}
        fill={theme.controlPlaneFill}
        opacity={0}
      />
      <Txt
        ref={cmLabel}
        text="controller-manager"
        x={620}
        y={CP_Y - 60}
        fontFamily={theme.font}
        fontSize={18}
        fill={theme.controlPlane}
        opacity={0}
      />
      <Circle
        ref={cmCtrl1}
        x={620 - 80}
        y={CP_Y + 20}
        width={42}
        height={42}
        stroke={theme.controlPlane}
        lineWidth={2}
        opacity={0}
      />
      <Circle
        ref={cmCtrl2}
        x={620}
        y={CP_Y + 20}
        width={42}
        height={42}
        stroke={theme.controlPlane}
        lineWidth={2}
        opacity={0}
      />
      <Circle
        ref={cmCtrl3}
        x={620 + 80}
        y={CP_Y + 20}
        width={42}
        height={42}
        stroke={theme.controlPlane}
        lineWidth={2}
        opacity={0}
      />

      {/* Hub-spoke links — apiserver is the hub, dashed lines flow data
          out to each other component. */}
      <Line
        ref={linkEtcd}
        points={[[-355, -240], [-595, -240]]}
        stroke={theme.controlPlane}
        lineWidth={1.5}
        lineDash={[6, 6]}
        opacity={0}
      />
      <Line
        ref={linkScheduler}
        points={[[-165, -240], [55, -240]]}
        stroke={theme.controlPlane}
        lineWidth={1.5}
        lineDash={[6, 6]}
        opacity={0}
      />
      <Line
        ref={linkCm}
        points={[[-165, -240], [475, -240]]}
        stroke={theme.controlPlane}
        lineWidth={1.5}
        lineDash={[6, 6]}
        opacity={0}
      />

      {/* New heartbeats fan from each kubelet's post-shift world position
          to the apiserver. */}
      <Line
        ref={newHbA}
        points={[heartbeatStart(-HOST_X), apiserverTarget]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={newHbB}
        points={[heartbeatStart(0), apiserverTarget]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={newHbC}
        points={[heartbeatStart(HOST_X), apiserverTarget]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />

      {/* Closing frame — appears at the end of the scene, encloses the
          full system, then collapses to nothing for the cut to scene 12. */}
      <Rect
        ref={closingFrame}
        width={1820}
        height={920}
        radius={36}
        stroke={theme.highlight}
        lineWidth={4}
        shadowColor={theme.highlight}
        shadowBlur={0}
        opacity={0}
      />
    </>,
  );

  spawn(watcherA().idle());
  spawn(watcherB().idle());
  spawn(watcherC().idle());

  yield* waitFor(0.4615);

  yield* all(
    stage().scale(STAGE_TARGET_SCALE, 0.9231, easeInOutCubic),
    stage().position.y(STAGE_TARGET_Y, 0.9231, easeInOutCubic),
    oldHbA().opacity(0, 0.5385),
    oldHbB().opacity(0, 0.5385),
    oldHbC().opacity(0, 0.5385),
  );
  yield* waitFor(0.3462);

  yield* all(
    cpRegion().opacity(0.6, 0.5769),
    cpLabel().opacity(1, 0.4615),
  );
  yield* waitFor(0.4615);

  // kube-apiserver lights up.
  yield* all(
    apiserver().opacity(1, 0.4615),
    apiserverLabel().opacity(1, 0.4615),
  );
  yield* waitFor(0.3077);

  // "every component talks through it" — heartbeats draw to the apiserver.
  yield* all(
    newHbA().opacity(0.7, 0.3077),
    newHbA().end(1, 0.6923, easeOutCubic),
    newHbB().opacity(0.7, 0.3077),
    newHbB().end(1, 0.6923, easeOutCubic),
    newHbC().opacity(0.7, 0.3077),
    newHbC().end(1, 0.6923, easeOutCubic),
  );
  yield* waitFor(0.4615);

  // etcd appears with its link to apiserver flowing.
  yield* all(
    etcd().opacity(1, 0.4615),
    etcdLabel().opacity(1, 0.4615),
    linkEtcd().opacity(0.7, 0.5385),
  );
  spawn(flowDashes(linkEtcd()));
  yield* waitFor(0.5769);

  // kube-scheduler with its link.
  yield* all(
    scheduler().opacity(1, 0.4615),
    schedulerLabel().opacity(1, 0.4615),
    linkScheduler().opacity(0.7, 0.5385),
  );
  spawn(flowDashes(linkScheduler()));
  yield* waitFor(0.5769);

  // controller-manager with its link.
  yield* all(
    cmRect().opacity(1, 0.4615),
    cmLabel().opacity(1, 0.4615),
    linkCm().opacity(0.7, 0.5385),
  );
  spawn(flowDashes(linkCm()));
  yield* sequence(
    0.15,
    cmCtrl1().opacity(1, 0.3462),
    cmCtrl2().opacity(1, 0.3462),
    cmCtrl3().opacity(1, 0.3462),
  );

  yield* waitFor(1.2308);

  // Closing — a glowing frame envelops the full system, the contents fade
  // out inside it, then the frame collapses to nothing. Scene 12 picks it
  // up and reopens.
  yield* all(
    closingFrame().opacity(0.9, 0.4615),
    closingFrame().shadowBlur(40, 0.6154),
  );
  yield* waitFor(0.2308);

  yield* all(
    stage().opacity(0, 0.6154),
    cpRegion().opacity(0, 0.6154),
    cpLabel().opacity(0, 0.6154),
    etcd().opacity(0, 0.6154),
    etcdLabel().opacity(0, 0.6154),
    apiserver().opacity(0, 0.6154),
    apiserverLabel().opacity(0, 0.6154),
    scheduler().opacity(0, 0.6154),
    schedulerLabel().opacity(0, 0.6154),
    cmRect().opacity(0, 0.6154),
    cmLabel().opacity(0, 0.6154),
    cmCtrl1().opacity(0, 0.6154),
    cmCtrl2().opacity(0, 0.6154),
    cmCtrl3().opacity(0, 0.6154),
    linkEtcd().opacity(0, 0.6154),
    linkScheduler().opacity(0, 0.6154),
    linkCm().opacity(0, 0.6154),
    newHbA().opacity(0, 0.6154),
    newHbB().opacity(0, 0.6154),
    newHbC().opacity(0, 0.6154),
  );

  yield* all(
    closingFrame().size([0, 0], 0.8, easeInOutCubic),
    closingFrame().shadowBlur(0, 0.6154),
  );

  yield* waitFor(0.3077);
});
