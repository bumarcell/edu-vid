import {Circle, Layout, LayoutProps, Rect, Txt} from '@motion-canvas/2d';
import {ThreadGenerator, linear, loop} from '@motion-canvas/core';
import {theme} from '../theme';

const TEETH_COUNT = 8;
const TOOTH_RADIUS = 28;

/**
 * The gear shape itself — body circle, ring of teeth, center hub.
 * Kept private so rotation animates just the gear without spinning the label.
 */
class Gear extends Circle {
  public constructor() {
    super({
      width: 40,
      height: 40,
      stroke: theme.controlPlane,
      lineWidth: 2.5,
    });

    for (let i = 0; i < TEETH_COUNT; i++) {
      const angle = (i / TEETH_COUNT) * Math.PI * 2;
      this.add(
        new Rect({
          width: 8,
          height: 14,
          fill: theme.controlPlane,
          x: Math.cos(angle) * TOOTH_RADIUS,
          y: Math.sin(angle) * TOOTH_RADIUS,
          rotation: (i / TEETH_COUNT) * 360,
        }),
      );
    }

    this.add(
      new Circle({
        width: 12,
        height: 12,
        fill: theme.controlPlane,
      }),
    );
  }
}

export interface ControllerProps extends LayoutProps {
  label?: string;
}

/**
 * Generic controller / watcher — a rotating gear with an optional label below.
 * Used for any "thing that watches and reacts" before it gets a real name.
 */
export class Controller extends Layout {
  private readonly gear: Gear;
  private readonly labelNode?: Txt;

  public constructor({label, ...props}: ControllerProps = {}) {
    super(props);

    this.gear = new Gear();
    this.add(this.gear);

    if (label) {
      this.labelNode = new Txt({
        text: label,
        fontFamily: theme.font,
        fontSize: 22,
        fill: theme.controlPlane,
        y: 60,
      });
      this.add(this.labelNode);
    }
  }

  public *pulse(): ThreadGenerator {
    yield* this.scale(1.2, 0.3);
    yield* this.scale(1, 0.4);
  }

  /**
   * Continuous slow rotation of the gear shape only — label stays upright.
   * Run as a background task: `yield spawn(controller().idle())`.
   */
  public *idle(secondsPerRotation = 16): ThreadGenerator {
    yield* loop(Infinity, () =>
      this.gear.rotation(this.gear.rotation() + 360, secondsPerRotation, linear),
    );
  }
}
