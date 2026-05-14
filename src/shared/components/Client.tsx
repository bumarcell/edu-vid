import {Layout, LayoutProps, Rect, Txt} from '@motion-canvas/2d';
import {theme} from '../theme';

export interface ClientProps extends LayoutProps {
  name?: string;
}

/**
 * A generic client rendered as a stylised laptop — a screen rectangle with
 * the client name inside, and a slightly wider base below.
 */
export class Client extends Layout {
  public constructor({name = 'client', ...props}: ClientProps = {}) {
    super(props);

    // Screen
    this.add(
      new Rect({
        y: -8,
        width: 160,
        height: 100,
        radius: 7,
        stroke: theme.network,
        lineWidth: 2,
        fill: theme.bg,
      }),
    );

    // Label on the screen
    this.add(
      new Txt({
        text: name,
        y: -8,
        fontFamily: theme.font,
        fontSize: 18,
        fill: theme.network,
      }),
    );

    // Base (slightly wider than screen)
    this.add(
      new Rect({
        y: 50,
        width: 190,
        height: 10,
        radius: 3,
        stroke: theme.network,
        lineWidth: 1.5,
        fill: theme.bg,
      }),
    );
  }
}
