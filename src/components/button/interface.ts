import type { VueNode } from '@/vc-util/type';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, HTMLAttributes, VNode } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks/useMergeSemantic';
import type { SizeType } from '../config-provider/SizeContext';
import { PresetColors } from '../theme/internal';

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

export type LegacyButtonType = ButtonType | 'danger';

export type ButtonSemanticName = 'root' | 'icon' | 'content';

export type ButtonClassNamesType = SemanticClassNamesType<BaseButtonProps, ButtonSemanticName>;
export type ButtonStylesType = SemanticStylesType<BaseButtonProps, ButtonSemanticName>;

export interface BaseButtonProps {
  type?: ButtonType;
  color?: ButtonColorType;
  variant?: ButtonVariantType;
  icon?: VueNode;
  iconPosition?: 'start' | 'end';
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number; icon?: VueNode };
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  [key: `data-${string}`]: string;
  classNames?: ButtonClassNamesType;
  styles?: ButtonStylesType;

  // FloatButton reuse the Button as sub component,
  // But this should not consume context semantic classNames and styles.
  // Use props here to avoid context solution cost for normal usage.
  /** @private Only for internal usage. Do not use in your production */
  _skipSemantic?: boolean;
}

type MergedHTMLAttributes = Omit<
  HTMLAttributes & ButtonHTMLAttributes & AnchorHTMLAttributes,
  'type' | 'color' | 'class' | 'disabled'
>;

export interface ButtonProps extends BaseButtonProps, /** @vue-ignore */ MergedHTMLAttributes {
  style?: CSSProperties;
  href?: string;
  htmlType?: ButtonHTMLType;
  autoInsertSpace?: boolean;
  autofocus?: boolean | undefined;
  onClick?: ButtonHTMLAttributes['onClick'];
}

export type ButtonSlots = {
  icon?: () => VNode[];
  default?: () => VNode[];
};

export type ColorVariantPairType = [color?: ButtonColorType, variant?: ButtonVariantType];
export type LoadingConfigType = {
  loading: boolean;
  delay: number;
};
