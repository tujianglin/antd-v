import clsx from 'clsx';
import { Fragment, h, type VNode } from 'vue';
import type {
  BaseButtonProps,
  ButtonType,
  ButtonVariantType,
  ColorVariantPairType,
  LegacyButtonType,
  LoadingConfigType,
} from './interface';

export const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  // `link` is not a real color but we should compatible with it
  link: ['link' as any, 'link'],
  text: ['default', 'text'],
};

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

export function getLoadingConfig(loading: BaseButtonProps['loading']): LoadingConfigType {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay,
    };
  }

  return {
    loading: !!loading,
    delay: 0,
  };
}

function isFragment(node: VNode): boolean {
  return node.type === Fragment;
}

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
  const mergedClass = clsx(props?.class, className);
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
    let isCurrentChildPure = false;

    if (typeof child.children === 'string') {
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
