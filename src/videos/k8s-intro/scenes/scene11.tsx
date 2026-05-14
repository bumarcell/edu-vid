import {Circle, Line, makeScene2D, Polygon, Rect, Txt} from '@motion-canvas/2d';
import {all, chain, createRef, easeOutCubic, sequence, waitFor} from '@motion-canvas/core';
import {Container} from '@shared/components/Container';
import {Host} from '@shared/components/Host';
import {theme} from '@shared/theme';

const HOST_W = 360;
const HOST_H = 260;
const HOST_GAP = 50;
const HOST_X = HOST_W + HOST_GAP;
const WORKER_Y = 320;

const CP_Y = -240;
const CP_REGION_TOP = -360;
const CP_REGION_BOTTOM = -120;

/**
 * Scene 11 — The control plane.
 * Narration: "All of that reporting flows into the control plane — a
 * separate set of nodes whose only job is to run the brain of the cluster.
 * At the center is the kube-apiserver — every component talks through it.
 * Behind it, etcd — a key-value store that holds the entire desired state.
 * The kube-scheduler is the invisible hand from earlier. And the
 * controller-manager runs all those little watchers we kept inventing."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

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
  const upA = createRef<Line>();
  const upB = createRef<Line>();
  const upC = createRef<Line>();

  view.add(
    <>
      {/* Worker nodes at the bottom — three small hosts with containers */}
      <Host name="Worker Node" width={HOST_W} height={HOST_H} x={-HOST_X} y={WORKER_Y} />
      <Host name="Worker Node" width={HOST_W} height={HOST_H} x={0} y={WORKER_Y} />
      <Host name="Worker Node" width={HOST_W} height={HOST_H} x={HOST_X} y={WORKER_Y} />
      <Container name="my-app" x={-HOST_X} y={WORKER_Y + 40} />
      <Container name="my-app" x={0} y={WORKER_Y + 40} />
      <Container name="my-app" x={HOST_X} y={WORKER_Y + 40} />

      {/* Control plane region outline (the "brain of the cluster") */}
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
        opacity={0}
        textAlign="left"
        offset={[-1, 0]}
      />

      {/* etcd — leftmost, cylindrical */}
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

      {/* kube-apiserver — central hexagonal hub */}
      <Polygon
        ref={apiserver}
        sides={6}
        x={-260}
        y={CP_Y}
        width={190}
        height={190}
        stroke={theme.controlPlane}
        lineWidth={3}
        fill={theme.controlPlaneFill}
        rotation={30}
        opacity={0}
      />
      <Txt
        ref={apiserverLabel}
        text={'kube-\napiserver'}
        x={-260}
        y={CP_Y}
        fontFamily={theme.font}
        fontSize={20}
        fill={theme.controlPlane}
        textAlign="center"
        opacity={0}
      />

      {/* kube-scheduler */}
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

      {/* controller-manager with three mini controllers inside */}
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

      {/* Heartbeat arrows from each worker up to the apiserver */}
      <Line
        ref={upA}
        points={[[-HOST_X, WORKER_Y - HOST_H / 2], [-260, CP_Y + 100]]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={upB}
        points={[[0, WORKER_Y - HOST_H / 2], [-260, CP_Y + 100]]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
      <Line
        ref={upC}
        points={[[HOST_X, WORKER_Y - HOST_H / 2], [-260, CP_Y + 100]]}
        stroke={theme.controlPlane}
        lineWidth={2}
        lineDash={[6, 6]}
        endArrow
        arrowSize={10}
        opacity={0}
        end={0}
      />
    </>,
  );

  yield* waitFor(0.8);

  // 1. Control plane region appears.
  yield* all(
    cpRegion().opacity(0.6, 1),
    cpLabel().opacity(1, 0.8),
  );
  yield* waitFor(1.2);

  // 2. kube-apiserver lights up first (the hub).
  yield* all(
    apiserver().opacity(1, 0.8),
    apiserverLabel().opacity(1, 0.8),
  );
  yield* waitFor(1);

  // 3. etcd appears behind the apiserver.
  yield* all(
    etcd().opacity(1, 0.8),
    etcdLabel().opacity(1, 0.8),
  );
  yield* waitFor(1);

  // 4. kube-scheduler.
  yield* all(
    scheduler().opacity(1, 0.8),
    schedulerLabel().opacity(1, 0.8),
  );
  yield* waitFor(1);

  // 5. controller-manager with its little controllers.
  yield* all(
    cmRect().opacity(1, 0.8),
    cmLabel().opacity(1, 0.8),
  );
  yield* sequence(
    0.1,
    cmCtrl1().opacity(1, 0.6),
    cmCtrl2().opacity(1, 0.6),
    cmCtrl3().opacity(1, 0.6),
  );
  yield* waitFor(1.2);

  // 6. Arrows from each worker upward into the apiserver.
  yield* all(
    upA().opacity(0.7, 0.6),
    upA().end(1, 1.2, easeOutCubic),
    upB().opacity(0.7, 0.6),
    upB().end(1, 1.2, easeOutCubic),
    upC().opacity(0.7, 0.6),
    upC().end(1, 1.2, easeOutCubic),
  );

  yield* waitFor(4);
});
