import type { DialogProps } from '@/vc-component/dialog';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';
import type { MaskType } from '../_util/hooks/useMergedMask';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { ButtonProps, LegacyButtonType } from '../button/interface';
import type { DirectionType } from '../config-provider';

export type SemanticName = 'root' | 'header' | 'body' | 'footer' | 'container' | 'title' | 'wrapper' | 'mask';

export type ModalClassNamesType = SemanticClassNamesType<ModalProps, SemanticName>;

export type ModalStylesType = SemanticStylesType<ModalProps, SemanticName>;

export type FooterRender = (props: { originNode: VueNode; extra: { OkBtn: VueNode; CancelBtn: VueNode } }) => VueNode;

interface ModalCommonProps
  extends Omit<
    DialogProps,
    | 'footer'
    | 'width'
    | 'onClose'
    | 'animation'
    | 'maskAnimation'
    | 'transitionName'
    | 'maskTransitionName'
    | 'mask'
    | 'classNames'
    | 'styles'
  > {
  footer?: VueNode | FooterRender;
  closable?: boolean | (Exclude<ClosableType, boolean> & { onClose?: () => void; afterClose?: () => void });
  classNames?: ModalClassNamesType;
  styles?: ModalStylesType;
}

export interface ModalProps extends ModalCommonProps {
  /** Whether the modal dialog is visible or not */
  open?: boolean;
  /** Whether to apply loading visual effect for OK button or not */
  confirmLoading?: boolean;
  /** The modal dialog's title */
  title?: VueNode;
  /** Specify a function that will be called when a user clicks the OK button */
  onOk?: (e) => void;
  /** Specify a function that will be called when a user clicks mask, close button on top right or Cancel button */
  onCancel?: (e) => void;
  afterClose?: () => void;
  /** Callback when the animation ends when Modal is turned on and off */
  afterOpenChange?: (open: boolean) => void;
  /** Centered Modal */
  centered?: boolean;
  /** Width of the modal dialog */
  width?: string | number | Partial<Record<Breakpoint, string | number>>;
  /** Text of the OK button */
  okText?: VueNode;
  /** Button `type` of the OK button */
  okType?: LegacyButtonType;
  /** Text of the Cancel button */
  cancelText?: VueNode;
  /** Whether to close the modal dialog when the mask (area outside the modal) is clicked */
  maskClosable?: boolean;
  /** Force render Modal */
  forceRender?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  style?: CSSProperties;
  wrapClassName?: string;
  maskTransitionName?: string;
  transitionName?: string;
  class?: string;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  getContainer?: string | HTMLElement | getContainerFunc | false;
  zIndex?: number;
  mask?: MaskType;
  keyboard?: boolean;
  wrapProps?: any;
  prefixCls?: string;
  closeIcon?: VueNode;
  modalRender?: (node: VueNode) => VueNode;
  focusTriggerAfterClose?: boolean;
  mousePosition?: MousePosition;
  /**
   * @since 5.18.0
   */
  loading?: boolean;
  classNames?: ModalClassNamesType;
  styles?: ModalStylesType;
}

type getContainerFunc = () => HTMLElement;

export interface ModalFuncProps extends ModalCommonProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  open?: boolean;
  title?: VueNode;
  content?: VueNode;
  // TODO: find out exact types
  onOk?: (...args: any[]) => any;
  onCancel?: (...args: any[]) => any;
  afterClose?: () => void;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  centered?: boolean;
  width?: string | number;
  okText?: VueNode;
  okType?: LegacyButtonType;
  cancelText?: VueNode;
  icon?: VueNode;
  mask?: MaskType;
  maskClosable?: boolean;
  zIndex?: number;
  okCancel?: boolean;
  style?: CSSProperties;
  wrapClassName?: string;
  type?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm';
  keyboard?: boolean;
  getContainer?: string | HTMLElement | getContainerFunc | false;
  autoFocusButton?: null | 'ok' | 'cancel';
  transitionName?: string;
  maskTransitionName?: string;
  direction?: DirectionType;
  closeIcon?: VueNode;
  footer?: ModalProps['footer'];
  modalRender?: (node: VueNode) => VueNode;
  focusTriggerAfterClose?: boolean;
}

export interface ModalLocale {
  okText: string;
  cancelText: string;
  justOkText: string;
}

export type MousePosition = { x: number; y: number } | null;
