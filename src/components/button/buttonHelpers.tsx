import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, HTMLAttributes, VNode } from 'vue';
import type { SizeType } from '../config-provider/SizeContext';
import { PresetColors } from '../theme/interface';

export type LegacyButtonType = ButtonType | 'danger';

export type ButtonSemanticName = 'root' | 'icon' | 'content';
export interface BaseButtonProps {
  type?: ButtonType;
  color?: ButtonColorType;
  variant?: ButtonVariantType;
  icon?: VNode;
  iconPosition?: 'start' | 'end';
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number; icon?: VNode };
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  [key: `data-${string}`]: string;
  classNames?: Partial<Record<ButtonSemanticName, string>>;
  styles?: Partial<Record<ButtonSemanticName, CSSProperties>>;

  // FloatButton reuse the Button as sub component,
  // But this should not consume context semantic classNames and styles.
  // Use props here to avoid context solution cost for normal usage.
  /** @private Only for internal usage. Do not use in your production */
  _skipSemantic?: boolean;
}

type MergedHTMLAttributes = Omit<HTMLAttributes & ButtonHTMLAttributes & AnchorHTMLAttributes, 'type' | 'color' | 'disabled'>;

export interface ButtonProps extends BaseButtonProps, /* @vue-ignore */ MergedHTMLAttributes {
  href?: string;
  htmlType?: ButtonHTMLType;
  autoInsertSpace?: boolean;
}

const rxTwoCNChar = /^[\u4E00-\u9FA5]{2}$/;
export const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

export function convertLegacyProps(type?: LegacyButtonType): Pick<BaseButtonProps, 'danger' | 'type'> {
  if (type === 'danger') {
    return { danger: true };
  }
  return { type };
}

export function isString(str: unknown): str is string {
  return typeof str === 'string';
}

export function isUnBorderedButtonVariant(type?: ButtonVariantType) {
  return type === 'text' || type === 'link';
}

const _ButtonTypes = ['default', 'primary', 'dashed', 'link', 'text'] as const;
export type ButtonType = (typeof _ButtonTypes)[number];

const _ButtonShapes = ['default', 'circle', 'round', 'square'] as const;
export type ButtonShape = (typeof _ButtonShapes)[number];

const _ButtonHTMLTypes = ['submit', 'button', 'reset'] as const;
export type ButtonHTMLType = (typeof _ButtonHTMLTypes)[number];

export const _ButtonVariantTypes = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'] as const;
export type ButtonVariantType = (typeof _ButtonVariantTypes)[number];

export const _ButtonColorTypes = ['default', 'primary', 'danger', ...PresetColors] as const;

export type ButtonColorType = (typeof _ButtonColorTypes)[number];
