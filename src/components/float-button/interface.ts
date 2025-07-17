import type { ButtonHTMLAttributes, CSSProperties, HtmlHTMLAttributes } from 'vue';
import type { RenderNode } from '../_util/type';
import type { ButtonHTMLType, ButtonSemanticName } from '../button/buttonHelpers';

export type FloatButtonElement = HTMLAnchorElement & HTMLButtonElement;

export interface FloatButtonRef {
  nativeElement: FloatButtonElement | null;
}

export type FloatButtonType = 'default' | 'primary';

export type FloatButtonShape = 'circle' | 'square';

export type FloatButtonGroupTrigger = 'click' | 'hover';

// export type FloatButtonBadgeProps = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>;

export type FloatButtonSemanticName = ButtonSemanticName;

type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

export interface FloatButtonProps {
  // Style
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  rootClassName?: string;
  classNames?: Partial<Record<FloatButtonSemanticName, string>>;
  styles?: Partial<Record<FloatButtonSemanticName, CSSProperties>>;

  // Others
  icon?: RenderNode;
  content?: RenderNode;
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  // tooltip?: RenderNode | TooltipProps;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  // badge?: FloatButtonBadgeProps;
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
type InternalFloatButtonGroupSemanticName = 'root' | 'list';

export interface FloatButtonGroupProps extends FloatButtonProps {
  // Styles
  classNames?: Partial<Record<InternalFloatButtonGroupSemanticName, string>> & {
    item?: FloatButtonProps['classNames'];
    trigger?: FloatButtonProps['classNames'];
  };
  styles?: Partial<Record<InternalFloatButtonGroupSemanticName, CSSProperties>> & {
    item?: FloatButtonProps['styles'];
    trigger?: FloatButtonProps['styles'];
  };

  // Control
  trigger?: FloatButtonGroupTrigger;
  onOpenChange?: (open: boolean) => void;

  // UI
  closeIcon?: RenderNode;
  placement?: 'top' | 'left' | 'right' | 'bottom';
}
