import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface ContainerProps extends RectProps {
  name?: string;
  /**
   * Optional IP shown below the container. Mirrors the IP styling on the
   * Service pill so the contrast (changing pod IPs vs. stable Service IP)
   * reads visually. Omit to render the container without an IP label.
   */
  ip?: string;
}

/**
 * A single container — rounded rect with a mono label.
 * Exposes crash(), restart(), and changeIp() as generators so scenes can
 * `yield*` them.
 */
export class Container extends Rect {
  private readonly label: Txt;
  private readonly ipLabel?: Txt;

  public constructor({name = 'my-app', ip, ...props}: ContainerProps = {}) {
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

    if (ip) {
      this.ipLabel = new Txt({
        text: ip,
        // Container is 140 tall (centered on origin), so its bottom edge
        // is at y=70. Place IP just below with a small gap.
        y: 100,
        fontFamily: theme.font,
        fontSize: 16,
        fill: theme.container,
        opacity: 0.7,
      });
      this.add(this.ipLabel);
    }
  }

  public *crash(): ThreadGenerator {
    const startX = this.position.x();
    const startY = this.position.y();

    const colorTweens = [
      this.stroke(theme.containerFail, 0.375),
      this.label.fill(theme.containerFail, 0.375),
    ];
    if (this.ipLabel) {
      colorTweens.push(this.ipLabel.fill(theme.containerFail, 0.375));
    }
    yield* all(...colorTweens);

    yield* this.position.x(startX + 12, 0.075);
    yield* this.position.x(startX - 12, 0.075);
    yield* this.position.x(startX + 8, 0.075);
    yield* this.position.x(startX, 0.075);
    yield* all(
      this.opacity(0, 0.75),
      this.position.y(startY + 40, 0.75),
    );
  }

  public *restart(): ThreadGenerator {
    const startY = this.position.y() - 40;
    this.stroke(theme.container);
    this.label.fill(theme.container);
    this.ipLabel?.fill(theme.container);
    this.position.y(startY);
    yield* this.opacity(1, 0.6);
  }

  public *changeIp(newIp: string, duration = 0.6): ThreadGenerator {
    if (!this.ipLabel) return;
    yield* this.ipLabel.opacity(0, duration / 2);
    this.ipLabel.text(newIp);
    yield* this.ipLabel.opacity(0.7, duration / 2);
  }
}
