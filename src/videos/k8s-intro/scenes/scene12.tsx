import {makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, waitFor} from '@motion-canvas/core';
import {theme} from '@shared/theme';

/**
 * Scene 12 — Closing.
 *
 * Picks up from Scene 11's closed frame (collapsed to size 0) and reopens
 * it as a glowing Kubernetes cube. Title and outro caption follow.
 *
 * Narration: "That's it — at least from far away. Kubernetes isn't magic;
 * it's just the obvious set of things you'd build if you started with one
 * container and kept asking 'okay, but what if that breaks?' We named the
 * pieces today, but we glossed over a lot. We'll go deeper in the next ones."
 */
export default makeScene2D(function* (view) {
  view.fill(theme.bg);

  const frame = createRef<Rect>();
  const title = createRef<Txt>();
  const caption = createRef<Txt>();

  view.add(
    <>
      {/* Frame starts closed (size 0) to match scene 11's final state. */}
      <Rect
        ref={frame}
        width={0}
        height={0}
        radius={28}
        stroke={theme.highlight}
        lineWidth={4}
        shadowColor={theme.highlight}
        shadowBlur={0}
        opacity={0.9}
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
        text="more? like and comment =)"
        y={220}
        fontFamily={theme.font}
        fontSize={22}
        fill={theme.network}
        opacity={0}
      />
    </>,
  );

  yield* waitFor(0.3077);

  // Reopen — frame grows from nothing to cube size; glow expands.
  yield* all(
    frame().size([280, 280], 1.05, easeOutCubic),
    frame().shadowBlur(40, 0.9231),
  );

  // Title lands inside the cube.
  yield* title().opacity(1, 0.4615);

  // Outro caption.
  yield* waitFor(0.6923);
  yield* caption().opacity(0.8, 0.5769, easeInOutCubic);

  yield* waitFor(2.3077);
});
