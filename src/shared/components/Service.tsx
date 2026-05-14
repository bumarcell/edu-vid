import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface ServiceProps extends RectProps {
  name?: string;
  ip?: string;
}

/**
 * A stable virtual address that routes to whichever backing containers are
 * alive. Rendered as a purple pill (very rounded rect) with a name and an
 * IP-style label. Use renameTo() to morph the name label (e.g. the reveal
 * moment swaps "stable address" → "Service").
 */
export class Service extends Rect {
  private readonly nameLabel: Txt;
  private readonly ipLabel: Txt;

  public constructor({name = 'Service', ip = '10.0.0.42', ...props}: ServiceProps = {}) {
    super({
      width: 360,
      height: 80,
      radius: 40,
      stroke: theme.service,
      lineWidth: 3,
      fill: 'rgba(181, 123, 255, 0.08)',
      ...props,
    });

    this.nameLabel = new Txt({
      text: name,
      y: -12,
      fontFamily: theme.font,
      fontSize: 24,
      fill: theme.service,
    });
    this.add(this.nameLabel);

    this.ipLabel = new Txt({
      text: ip,
      y: 16,
      fontFamily: theme.font,
      fontSize: 16,
      fill: theme.service,
      opacity: 0.7,
    });
    this.add(this.ipLabel);
  }

  public *renameTo(name: string, duration = 1): ThreadGenerator {
    yield* this.nameLabel.opacity(0, duration / 2);
    this.nameLabel.text(name);
    yield* this.nameLabel.opacity(1, duration / 2);
  }
}
