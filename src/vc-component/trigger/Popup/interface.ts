import type { CSSMotionProps } from '@/vc-component/motion';
import type { CSSProperties } from 'vue';
import type { AlignType, ArrowPos, ArrowTypeOuter, TriggerProps } from '../interface';

export interface MobileConfig {
  mask?: boolean;
  /** Set popup motion. You can ref `rc-motion` for more info. */
  motion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;
}

export interface PopupProps {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  target: HTMLElement;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onPointerEnter?: (e: MouseEvent) => void;
  onPointerDownCapture?: (e: MouseEvent) => void;
  zIndex?: number;

  mask?: boolean;
  onVisibleChanged: (visible: boolean) => void;

  // Arrow
  align?: AlignType;
  arrow?: ArrowTypeOuter;
  arrowPos: ArrowPos;

  // Open
  open: boolean;
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom?: boolean;
  fresh?: boolean;

  // Click
  onClick?: (e: MouseEvent) => void;

  // Motion
  motion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;

  // Portal
  forceRender?: boolean;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  autoDestroy?: boolean;

  // Align
  ready: boolean;
  offsetX: number;
  offsetY: number;
  offsetR: number;
  offsetB: number;
  onAlign: VoidFunction;
  onPrepare: () => Promise<void>;

  // stretch
  stretch?: string;
  targetWidth?: number;
  targetHeight?: number;

  // Mobile
  mobile?: MobileConfig;
}
