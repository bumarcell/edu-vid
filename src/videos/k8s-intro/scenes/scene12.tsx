import {Layout, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, waitFor} from '@motion-canvas/core';
import {theme} from '@shared/theme';

/**
 * Scene 12 — Closing.
 * Narration: "That's it — at least from far away. Kubernetes isn't magic;
 * it's just the obvious set of things you'd build if you started with one
 * container and kept asking 'okay, but what if that breaks?' We named the
 * pieces today, but we glossed over a lot. We'll go deeper in the next ones."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const cube = createRef<Rect>();
  const title = createRef<Txt>();
  const caption = createRef<Txt>();

  // The video collapses to a single labeled cube. To keep this scene
  // self-contained we don't try to recreate the full landscape; the
  // crossfade from scene 11 carries the "everything shrinks" feeling.
  view.add(
    <Layout>
      <Rect
        ref={cube}
        width={280}
        height={280}
        radius={28}
        stroke={theme.highlight}
        lineWidth={4}
        shadowColor={theme.highlight}
        shadowBlur={40}
        scale={0}
      />
      <Txt
        ref={title}
        text="Kubernetes"
        y={0}
        fontFamily={theme.font}
        fontSize={36}
        fill={theme.highlight}
        opacity={0}
      />
      <Txt
        ref={caption}
        text="more, soon."
        y={220}
        fontFamily={theme.font}
        fontSize={22}
        fill={theme.network}
        opacity={0}
      />
    </Layout>,
  );

  // 1. The cube grows from nothing.
  yield* cube().scale(1, 1.8, easeOutCubic);

  // 2. Title fades in inside the cube.
  yield* title().opacity(1, 1);

  // 3. Closing caption underneath.
  yield* waitFor(2);
  yield* caption().opacity(0.8, 1.2, easeInOutCubic);

  yield* waitFor(6);
});
