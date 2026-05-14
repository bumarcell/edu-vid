import {Line, Rect, RectProps, Txt} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface HostProps extends RectProps {
  name?: string;
  /** Render the host already dead (dimmed + dead-colored stroke/label). */
  dead?: boolean;
}

export const HOST_DEAD_COLOR = theme.hostDead;
export const HOST_DEAD_OPACITY = 0.5;

const HEADER_HEIGHT = 56;
const SEPARATOR_INSET = 24;

/**
 * A worker host — a rounded rect with a subtle fill, a header strip with the
 * host name, and a thin separator line between the header and the content area.
 * Containers/watchers sit on top of it as siblings.
 */
export class Host extends Rect {
  private readonly label: Txt;
  private readonly separator: Line;

  public constructor({name = 'Host A', dead = false, ...props}: HostProps = {}) {
    const strokeColor = dead ? HOST_DEAD_COLOR : theme.host;

    super({
      width: 480,
      height: 420,
      radius: 24,
      stroke: strokeColor,
      lineWidth: 3,
      fill: theme.hostFill,
      ...props,
    });

    const w = this.size.x();
    const h = this.size.y();
    const headerCenterY = -h / 2 + HEADER_HEIGHT / 2;
    const sepY = -h / 2 + HEADER_HEIGHT;

    this.label = new Txt({
      text: name,
      y: headerCenterY,
      fontFamily: theme.font,
      fontSize: theme.hostLabelSize,
      fill: strokeColor,
    });
    this.add(this.label);

    this.separator = new Line({
      points: [
        [-w / 2 + SEPARATOR_INSET, sepY],
        [w / 2 - SEPARATOR_INSET, sepY],
      ],
      stroke: strokeColor,
      lineWidth: 1.5,
      opacity: 0.45,
    });
    this.add(this.separator);

    if (dead) {
      this.opacity(HOST_DEAD_OPACITY);
    }
  }

  public *die(): ThreadGenerator {
    yield* all(
      this.stroke(HOST_DEAD_COLOR, 0.45),
      this.label.fill(HOST_DEAD_COLOR, 0.45),
      this.separator.stroke(HOST_DEAD_COLOR, 0.45),
      this.opacity(HOST_DEAD_OPACITY, 0.9),
    );
  }

  public *revive(duration = 0.9): ThreadGenerator {
    yield* all(
      this.stroke(theme.host, duration),
      this.label.fill(theme.host, duration),
      this.separator.stroke(theme.host, duration),
      this.opacity(1, duration),
    );
  }
}
