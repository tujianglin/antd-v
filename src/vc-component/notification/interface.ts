import type { VueKey, VueNode } from '@/vc-util/type';
import type { AriaAttributes, CSSProperties, HTMLAttributes } from 'vue';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

type NoticeSemanticProps = 'wrapper';

export interface NoticeConfig {
  content?: VueNode;
  duration?: number | null;
  showProgress?: boolean;
  pauseOnHover?: boolean;

  closable?: boolean | ({ closeIcon?: any; onClose?: VoidFunction } & AriaAttributes);
  class?: string;
  style?: CSSProperties;
  classNames?: {
    [key in NoticeSemanticProps]?: string;
  };
  styles?: {
    [key in NoticeSemanticProps]?: CSSProperties;
  };
  /** @private Internal usage. Do not override in your code */
  props?: HTMLAttributes & Record<string, any>;

  onClose?: VoidFunction;
  onClick?: (e: MouseEvent) => void;
}

export interface OpenConfig extends NoticeConfig {
  key: VueKey;
  placement?: Placement;
  content?: VueNode;
  duration?: number | null;
}

export type InnerOpenConfig = OpenConfig & { times?: number };

export type Placements = Partial<Record<Placement, OpenConfig[]>>;

export type StackConfig =
  | boolean
  | {
      /**
       * When number is greater than threshold, notifications will be stacked together.
       * @default 3
       */
      threshold?: number;
      /**
       * Offset when notifications are stacked together.
       * @default 8
       */
      offset?: number;
      /**
       * Spacing between each notification when expanded.
       */
      gap?: number;
    };
