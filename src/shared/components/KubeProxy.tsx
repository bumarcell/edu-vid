import {Layout, LayoutProps, Polygon, Txt} from '@motion-canvas/2d';
import {ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

/**
 * kube-proxy — a small chevron that lives at the edge of a host and
 * programs the network rules. Glows briefly when it routes traffic.
 */
export class KubeProxy extends Layout {
  private readonly chevron: Polygon;

  public constructor(props: LayoutProps = {}) {
    super(props);

    this.chevron = new Polygon({
      sides: 3,
      width: 24,
      height: 24,
      stroke: theme.service,
      lineWidth: 2.5,
      rotation: 90, // point right
    });
    this.add(this.chevron);

    this.add(
      new Txt({
        text: 'kube-proxy',
        y: 28,
        fontFamily: theme.font,
        fontSize: 16,
        fill: theme.service,
      }),
    );
  }

  public *glow(): ThreadGenerator {
    yield* this.chevron.fill(theme.service, 0.2);
    yield* this.chevron.fill('rgba(0,0,0,0)', 0.3);
  }
}
