import type { QRProps } from '@/vc-component/qrcode';
import type { VueNode } from '@/vc-util/type';
import type { CanvasHTMLAttributes, CSSProperties, HTMLAttributes, SVGAttributes } from 'vue';
import type { Locale } from '../locale';

type ImageSettings = QRProps['imageSettings'];

export type { ImageSettings, QRProps };

export type QRPropsCanvas = QRProps & /** @vue-ignore */ CanvasHTMLAttributes;

export type QRPropsSvg = QRProps & /** @vue-ignore */ SVGAttributes;

export type QRStatus = 'active' | 'expired' | 'loading' | 'scanned';

export type StatusRenderInfo = {
  status: Exclude<QRStatus, 'active'>;
  locale: Locale['QRCode'];
  onRefresh?: () => void;
};

type SemanticName = 'root' | 'cover';

export interface QRCodeProps extends Omit<QRProps, 'fgColor'>, /** @vue-ignore */ HTMLAttributes {
  color?: string;
  type?: 'canvas' | 'svg';
  class?: string;
  style?: CSSProperties;
  rootClassName?: string;
  prefixCls?: string;
  icon?: string;
  iconSize?: number | { width: number; height: number };
  bordered?: boolean;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  status?: QRStatus;
  onRefresh?: () => void;
  statusRender?: (info: StatusRenderInfo) => VueNode;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}
