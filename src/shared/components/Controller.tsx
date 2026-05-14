import {Circle, Layout, LayoutProps, Rect, Txt} from '@motion-canvas/2d';
import {all, ThreadGenerator, linear, loop} from '@motion-canvas/core';
import {theme} from '../theme';

const TEETH_COUNT = 8;
const TOOTH_RADIUS = 28;
const ALIVE_COLOR = theme.controlPlane;
const DEAD_COLOR = theme.hostDead;

/**
 * The gear shape itself — body circle, ring of teeth, center hub.
 * Kept private so rotation animates just the gear without spinning the label.
 */
class Gear extends Circle {
  private readonly teeth: Rect[];
  private readonly hub: Circle;

  public constructor(alive = true) {
    const color = alive ? ALIVE_COLOR : DEAD_COLOR;
    super({
      width: 40,
      height: 40,
      stroke: color,
      lineWidth: 2.5,
    });

    this.teeth = [];
    for (let i = 0; i < TEETH_COUNT; i++) {
      const angle = (i / TEETH_COUNT) * Math.PI * 2;
      const tooth = new Rect({
        width: 8,
        height: 14,
        fill: color,
        x: Math.cos(angle) * TOOTH_RADIUS,
        y: Math.sin(angle) * TOOTH_RADIUS,
        rotation: (i / TEETH_COUNT) * 360,
      });
      this.teeth.push(tooth);
      this.add(tooth);
    }

    this.hub = new Circle({
      width: 12,
      height: 12,
      fill: color,
    });
    this.add(this.hub);
  }

  public *die(duration = 0.45): ThreadGenerator {
    yield* all(
      this.stroke(DEAD_COLOR, duration),
      this.hub.fill(DEAD_COLOR, duration),
      ...this.teeth.map((t) => t.fill(DEAD_COLOR, duration)),
    );
  }

  public *revive(duration = 0.45): ThreadGenerator {
    yield* all(
      this.stroke(ALIVE_COLOR, duration),
      this.hub.fill(ALIVE_COLOR, duration),
      ...this.teeth.map((t) => t.fill(ALIVE_COLOR, duration)),
    );
  }
}

export interface ControllerProps extends LayoutProps {
  label?: string;
  /** Start the controller already dead — gear and label rendered in the dead colour. */
  dead?: boolean;
}

/**
 * Generic controller / watcher — a rotating gear with an optional label below.
 * Used for any "thing that watches and reacts" before it gets a real name.
 *
 * Use die()/revive() to animate the colour shift when the host dies/comes back.
 */
export class Controller extends Layout {
  private readonly gear: Gear;
  private readonly labelNode?: Txt;

  public constructor({label, dead = false, ...props}: ControllerProps = {}) {
    super(props);

    this.gear = new Gear(!dead);
    this.add(this.gear);

    if (label) {
      this.labelNode = new Txt({
        text: label,
        fontFamily: theme.font,
        fontSize: 22,
        fill: dead ? DEAD_COLOR : ALIVE_COLOR,
        y: 60,
      });
      this.add(this.labelNode);
    }
  }

  public *die(duration = 0.45): ThreadGenerator {
    const tweens: ThreadGenerator[] = [this.gear.die(duration)];
    if (this.labelNode) {
      tweens.push(this.labelNode.fill(DEAD_COLOR, duration));
    }
    yield* all(...tweens);
  }

  public *revive(duration = 0.45): ThreadGenerator {
    const tweens: ThreadGenerator[] = [this.gear.revive(duration)];
    if (this.labelNode) {
      tweens.push(this.labelNode.fill(ALIVE_COLOR, duration));
    }
    yield* all(...tweens);
  }

  public *pulse(): ThreadGenerator {
    yield* this.scale(1.2, 0.225);
    yield* this.scale(1, 0.3);
  }

  /**
   * Continuous slow rotation of the gear shape only — label stays upright.
   * Run as a background task: `const t = spawn(controller().idle()); ... cancel(t)`.
   */
  public *idle(secondsPerRotation = 12): ThreadGenerator {
    yield* loop(Infinity, () =>
      this.gear.rotation(this.gear.rotation() + 360, secondsPerRotation, linear),
    );
  }
}
