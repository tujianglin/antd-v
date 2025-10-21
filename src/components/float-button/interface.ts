import type { VueNode } from '@/vc-util/type';
import type { ButtonHTMLAttributes, Component, CSSProperties, HtmlHTMLAttributes, VNode } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks/useMergeSemantic';
import type { BadgeProps } from '../badge';
import type { ButtonHTMLType, ButtonSemanticName } from '../button/interface';
import type { TooltipProps } from '../tooltip';

export type FloatButtonElement = HTMLAnchorElement & HTMLButtonElement;

export interface FloatButtonRef {
  nativeElement: FloatButtonElement | null;
}

export type FloatButtonType = 'default' | 'primary';

export type FloatButtonShape = 'circle' | 'square';

export type FloatButtonGroupTrigger = 'click' | 'hover';

export type FloatButtonBadgeProps = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>;

export type FloatButtonSemanticName = ButtonSemanticName;

export type FloatButtonClassNamesType = SemanticClassNamesType<FloatButtonProps, FloatButtonSemanticName>;
export type FloatButtonStylesType = SemanticStylesType<FloatButtonProps, FloatButtonSemanticName>;

type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

export interface FloatButtonProps {
  // Style
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  rootClassName?: string;
  classNames?: FloatButtonClassNamesType;
  styles?: FloatButtonStylesType;

  // Others
  icon?: VueNode;
  content?: VueNode;
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  tooltip?: VueNode | TooltipProps;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  badge?: FloatButtonBadgeProps;
  /**
   * @since 5.21.0
   * @default button
   */
  htmlType?: ButtonHTMLType;
  ariaLabel?: HtmlHTMLAttributes['aria-label'];

  onClick?: ButtonHTMLAttributes['onClick'];
  onMousedown?: ButtonHTMLAttributes['onMousedown'];
}

export const floatButtonPrefixCls = 'float-btn';

// FloatButton
type InternalFloatButtonGroupSemanticName =
  | 'root'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'trigger'
  | 'triggerIcon'
  | 'triggerContent';

export type FloatButtonGroupClassNamesType = SemanticClassNamesType<FloatButtonGroupProps, InternalFloatButtonGroupSemanticName>;
export type FloatButtonGroupStylesType = SemanticStylesType<FloatButtonGroupProps, InternalFloatButtonGroupSemanticName>;

export interface FloatButtonGroupProps extends FloatButtonProps {
  // Styles
  classNames?: FloatButtonGroupClassNamesType;
  styles?: FloatButtonGroupStylesType;

  // Control
  trigger?: FloatButtonGroupTrigger;
  onOpenChange?: (open: boolean) => void;

  // UI
  closeIcon?: VNode | Component;
  placement?: 'top' | 'left' | 'right' | 'bottom';
}
