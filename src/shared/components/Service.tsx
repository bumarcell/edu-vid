import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {theme} from '../theme';

export interface ServiceProps extends RectProps {
  name?: string;
  ip?: string;
}

/**
 * A Kubernetes Service — a stable virtual address that routes to whichever
 * backing containers are alive. Rendered as a purple pill (very rounded rect)
 * with a name and an IP-style label.
 */
export class Service extends Rect {
  public constructor({name = 'my-service', ip = '10.0.0.42', ...props}: ServiceProps = {}) {
    super({
      width: 360,
      height: 80,
      radius: 40, // fully rounded ends — pill shape
      stroke: theme.service,
      lineWidth: 3,
      fill: 'rgba(181, 123, 255, 0.08)',
      ...props,
    });

    this.add(
      new Txt({
        text: name,
        y: -12,
        fontFamily: theme.font,
        fontSize: 24,
        fill: theme.service,
      }),
    );
    this.add(
      new Txt({
        text: ip,
        y: 16,
        fontFamily: theme.font,
        fontSize: 16,
        fill: theme.service,
        opacity: 0.7,
      }),
    );
  }
}
