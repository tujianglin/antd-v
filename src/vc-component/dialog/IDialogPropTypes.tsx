import type { GetContainer } from '@/vc-util/PortalWrapper';
import type { CSSProperties, HTMLAttributes } from 'vue';

export type SemanticName = 'header' | 'body' | 'footer' | 'container' | 'title' | 'wrapper' | 'mask';

export type ModalClassNames = Partial<Record<SemanticName, string>>;

export type ModalStyles = Partial<Record<SemanticName, CSSProperties>>;

export type ClosableType = {
  closeIcon?: any;
  disabled?: boolean;
  afterClose?: () => any;
};

export type IDialogPropTypes = {
  class?: string;
  keyboard?: boolean;
  style?: CSSProperties;
  rootStyle?: CSSProperties;
  mask?: boolean;
  afterClose?: () => any;
  afterOpenChange?: (open: boolean) => void;
  onClose?: (e: MouseEvent) => any;
  closable?: boolean | (ClosableType & HTMLAttributes);
  maskClosable?: boolean;
  visible?: boolean;
  destroyOnHidden?: boolean;
  mousePosition?: {
    x: number;
    y: number;
  } | null;
  title?: any;
  footer?: any;
  transitionName?: string;
  maskTransitionName?: string;
  animation?: any;
  maskAnimation?: any;
  wrapStyle?: Record<string, any>;
  bodyStyle?: Record<string, any>;
  maskStyle?: Record<string, any>;
  prefixCls?: string;
  wrapClassName?: string;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
  bodyProps?: any;
  maskProps?: any;
  rootClassName?: string;
  classNames?: ModalClassNames;
  styles?: ModalStyles;
  wrapProps?: any;
  getContainer?: GetContainer | false;
  closeIcon?: any;
  modalRender?: (node: any) => any;
  forceRender?: boolean;
  // https://github.com/ant-design/ant-design/issues/19771
  // https://github.com/react-component/dialog/issues/95
  focusTriggerAfterClose?: boolean;

  // Refs
  panelRef?: HTMLDivElement;
};
