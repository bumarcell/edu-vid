import {Layout, LayoutProps, Polygon, Txt} from '@motion-canvas/2d';
import {ThreadGenerator} from '@motion-canvas/core';
import {theme} from '../theme';

export interface KubeProxyProps extends LayoutProps {
  label?: string;
}

/**
 * The per-host network router — a small chevron with a label.
 * Defaults to "kube-proxy" (the K8s name). Override `label` for pre-reveal
 * scenes that use friendlier terminology.
 */
export class KubeProxy extends Layout {
  private readonly chevron: Polygon;
  private readonly labelNode: Txt;

  public constructor({label = 'kube-proxy', ...props}: KubeProxyProps = {}) {
    super(props);

    this.chevron = new Polygon({
      sides: 3,
      width: 24,
      height: 24,
      stroke: theme.service,
      lineWidth: 2.5,
      rotation: 90,
    });
    this.add(this.chevron);

    this.labelNode = new Txt({
      text: label,
      y: 28,
      fontFamily: theme.font,
      fontSize: 16,
      fill: theme.service,
    });
    this.add(this.labelNode);
  }

  public *glow(): ThreadGenerator {
    yield* this.chevron.fill(theme.service, 0.4);
    yield* this.chevron.fill('rgba(0,0,0,0)', 0.3);
  }

  public *renameTo(label: string, duration = 1): ThreadGenerator {
    yield* this.labelNode.opacity(0, duration / 2);
    this.labelNode.text(label);
    yield* this.labelNode.opacity(1, duration / 2);
  }
}
