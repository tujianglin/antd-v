import { cn } from '@/utils/cn';
import { Fragment, h, type ButtonHTMLAttributes, type CSSProperties, type VNode } from 'vue';
import type { RenderNode } from '../_util/type';
import type { SizeType } from '../config-provider/SizeContext';
import { PresetColors } from '../theme/interface';

export type LegacyButtonType = ButtonType | 'danger';

export type ButtonSemanticName = 'root' | 'icon' | 'content';
export interface BaseButtonProps {
  style?: CSSProperties;
  class?: string;
  type?: ButtonType;
  color?: ButtonColorType;
  variant?: ButtonVariantType;
  icon?: RenderNode;
  iconPosition?: 'start' | 'end';
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number; icon?: RenderNode };
  prefixCls?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  [key: `data-${string}`]: string;
  classNames?: Partial<Record<ButtonSemanticName, string>>;
  styles?: Partial<Record<ButtonSemanticName, CSSProperties>>;
  onClick?: ButtonHTMLAttributes['onClick'];
  onMousedown?: ButtonHTMLAttributes['onMousedown'];
  // FloatButton reuse the Button as sub component,
  // But this should not consume context semantic classNames and styles.
  // Use props here to avoid context solution cost for normal usage.
  /** @private Only for internal usage. Do not use in your production */
  _skipSemantic?: boolean;
}

export interface ButtonProps extends BaseButtonProps {
  href?: string;
  htmlType?: ButtonHTMLType;
  autoInsertSpace?: boolean;
  autoFocus?: boolean | undefined;
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

function isFragment(node: VNode): boolean {
  return node.type === Fragment;
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

export function splitCNCharsBySpace(
  child: VNode | string | number,
  needInserted: boolean,
  style?: Record<string, any>,
  className?: string,
): VNode {
  const SPACE = needInserted ? ' ' : '';

  // 空值处理
  if (child === null || child === undefined || child === '') {
    return h(Fragment);
  }

  // 字符串处理
  if (typeof child === 'string' || typeof child === 'number') {
    const str = String(child);
    const content = isTwoCNChar(str) ? str.split('').join(SPACE) : str;
    return h('span', { class: className, style }, content);
  }

  // Fragment 直接包裹
  if (isFragment(child)) {
    return h('span', { class: className, style }, [child]);
  }

  // 普通 VNode
  const { props, children, type } = child;

  // 如果它是一个 HTML 标签节点，并且 children 是双中文字符
  if (isString(type) && typeof children === 'string' && isTwoCNChar(children)) {
    return h(
      type,
      {
        ...props,
        class: className,
        style,
      },
      children.split('').join(SPACE),
    );
  }

  // 其余情况：合并 class 和 style
  const mergedClass = cn(props?.class, className);
  const mergedStyle = { ...props?.style, ...style };

  return h(
    type as any,
    {
      ...props,
      class: mergedClass || undefined,
      style: mergedStyle,
    },
    children,
  );
}

export function spaceChildren(
  children: VNode[] | undefined,
  needInserted: boolean,
  style?: Record<string, any>,
  className?: string,
) {
  if (!children) return [];

  const childList: (VNode | string | number)[] = [];
  let isPrevChildPure = false;

  for (const child of children) {
    let current: string | number | VNode = child;

    // 获取文本内容
    const type = child.type;
    let isCurrentChildPure = false;

    if (type === Text && typeof child.children === 'string') {
      current = child.children;
      isCurrentChildPure = true;
    } else if (typeof child === 'string' || typeof child === 'number') {
      isCurrentChildPure = true;
    }

    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${current}`;
    } else {
      childList.push(current);
    }

    isPrevChildPure = isCurrentChildPure;
  }

  // 应用 splitCNCharsBySpace
  return childList.map((child) => splitCNCharsBySpace(child, needInserted, style, className));
}
