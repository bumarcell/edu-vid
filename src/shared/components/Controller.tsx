import {Circle, CircleProps, Txt} from '@motion-canvas/2d';
import {ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface ControllerProps extends CircleProps {
  label?: string;
}

/**
 * Generic controller / watcher — a small circle, optional label below.
 * Used for any "thing that watches and reacts" before it gets a real name.
 */
export class Controller extends Circle {
  public constructor({label, ...props}: ControllerProps = {}) {
    super({
      width: 64,
      height: 64,
      stroke: theme.controlPlane,
      lineWidth: 2.5,
      ...props,
    });

    if (label) {
      this.add(
        new Txt({
          text: label,
          fontFamily: theme.font,
          fontSize: 22,
          fill: theme.controlPlane,
          y: 56,
        }),
      );
    }
  }

  public *pulse(): ThreadGenerator {
    yield* this.scale(1.2, 0.15);
    yield* this.scale(1, 0.2);
  }
}
