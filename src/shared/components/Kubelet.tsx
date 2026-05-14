import {Layout, LayoutProps, Rect, Txt} from '@motion-canvas/2d';
import {theme} from '../theme';

/**
 * kubelet — the on-host agent that starts containers and reports their
 * status. Rendered as a small slate square with a label below it.
 */
export class Kubelet extends Layout {
  public constructor(props: LayoutProps = {}) {
    super(props);

    this.add(
      new Rect({
        width: 28,
        height: 28,
        radius: 4,
        stroke: theme.host,
        lineWidth: 2,
        fill: 'rgba(62, 92, 118, 0.2)',
      }),
    );

    this.add(
      new Txt({
        text: 'kubelet',
        y: 28,
        fontFamily: theme.font,
        fontSize: 16,
        fill: theme.host,
      }),
    );
  }
}
