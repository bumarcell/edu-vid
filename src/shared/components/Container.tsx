import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface ContainerProps extends RectProps {
  name?: string;
}

/**
 * A single container — rounded rect with a mono label.
 * Exposes crash() and restart() as generators so scenes can `yield*` them.
 */
export class Container extends Rect {
  private readonly label: Txt;

  public constructor({name = 'my-app', ...props}: ContainerProps = {}) {
    super({
      width: 280,
      height: 140,
      radius: 18,
      stroke: theme.container,
      lineWidth: 3,
      ...props,
    });

    this.label = new Txt({
      text: name,
      fontFamily: theme.font,
      fontSize: theme.labelSize,
      fill: theme.container,
    });
    this.add(this.label);
  }

  public *crash(): ThreadGenerator {
    const startX = this.position.x();
    const startY = this.position.y();

    yield* all(
      this.stroke(theme.containerFail, 0.5),
      this.label.fill(theme.containerFail, 0.5),
    );
    yield* this.position.x(startX + 12, 0.1);
    yield* this.position.x(startX - 12, 0.1);
    yield* this.position.x(startX + 8, 0.1);
    yield* this.position.x(startX, 0.1);
    yield* all(
      this.opacity(0, 1),
      this.position.y(startY + 40, 1),
    );
  }

  public *restart(): ThreadGenerator {
    const startY = this.position.y() - 40;
    this.stroke(theme.container);
    this.label.fill(theme.container);
    this.position.y(startY);
    yield* this.opacity(1, 0.8);
  }
}
