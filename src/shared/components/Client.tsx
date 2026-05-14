import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {theme} from '../theme';

export interface ClientProps extends RectProps {
  name?: string;
}

/**
 * A generic client — labeled rect, neutral color so it reads as "external".
 */
export class Client extends Rect {
  public constructor({name = 'client', ...props}: ClientProps = {}) {
    super({
      width: 180,
      height: 90,
      radius: 12,
      stroke: theme.network,
      lineWidth: 2.5,
      ...props,
    });

    this.add(
      new Txt({
        text: name,
        fontFamily: theme.font,
        fontSize: 22,
        fill: theme.network,
      }),
    );
  }
}
