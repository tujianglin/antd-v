import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';

interface DivProps {
  'data-testid'?: string;
}

export const NotificationPlacements = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as const;
export type NotificationPlacement = (typeof NotificationPlacements)[number];

export type IconType = 'success' | 'info' | 'error' | 'warning';

export type NotificationSemantic = 'root' | 'title' | 'description' | 'actions' | 'icon';

export type NotificationClassNamesType = SemanticClassNamesType<ArgsProps, NotificationSemantic>;

export type NotificationStylesType = SemanticStylesType<ArgsProps, NotificationSemantic>;
export interface ArgsProps {
  title: VueNode;
  description?: VueNode;
  actions?: VueNode;
  key?: VueKey;
  onClose?: () => void;
  duration?: number | null;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  icon?: VueNode;
  placement?: NotificationPlacement;
  style?: CSSProperties;
  class?: string;
  classNames?: NotificationClassNamesType;
  styles?: NotificationStylesType;
  readonly type?: IconType;
  onClick?: () => void;
  closeIcon?: VueNode;
  closable?:
    | boolean
    | (Exclude<ClosableType, boolean> & {
        onClose?: () => void;
      });
  props?: DivProps;
  role?: 'alert' | 'status';
}

type StaticFn = (args: ArgsProps) => void;

export interface NotificationInstance {
  success: StaticFn;
  error: StaticFn;
  info: StaticFn;
  warning: StaticFn;
  open: StaticFn;
  destroy(key?: VueKey): void;
}

export interface GlobalConfigProps {
  top?: number;
  bottom?: number;
  duration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  prefixCls?: string;
  getContainer?: () => HTMLElement | ShadowRoot;
  placement?: NotificationPlacement;
  closeIcon?: VueNode;
  closable?: ClosableType;
  rtl?: boolean;
  maxCount?: number;
  props?: DivProps;
}

export interface NotificationConfig {
  top?: number;
  bottom?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement | ShadowRoot;
  placement?: NotificationPlacement;
  maxCount?: number;
  rtl?: boolean;
  stack?: boolean | { threshold?: number };
  duration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  closeIcon?: VueNode;
  classNames?: NotificationClassNamesType;
  styles?: NotificationStylesType;
}
