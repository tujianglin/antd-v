import { isArray } from 'es-toolkit/compat';
import { cloneVNode, Fragment, isVNode, type VNode } from 'vue';
import type { AnyObject } from '../type';

/**
 * 获取插槽中的唯一子元素
 * @param slots - 包含默认插槽的对象
 * @returns 返回插槽中的唯一子元素
 * @throws 当插槽中没有恰好一个子元素时抛出错误
 */
export function onlyChild(child): VNode {
  // 获取默认插槽中的子元素数组，如果不存在则返回空数组
  const children = child || [];
  // 验证子元素数量是否为1
  if (children.length !== 1) {
    throw new Error(`Expected exactly one child, but got ${children.length}.`);
  }
  // 返回唯一的子元素
  return children[0];
}

/**
 * 判断节点是否有效
 * @param node - 虚拟节点或虚拟节点数组
 * @returns 如果节点有效返回true，否则返回false
 */
export function isValidNode(node): boolean {
  // 如果是数组，检查第一个元素是否为有效的虚拟节点
  if (isArray(node)) {
    return isVueNode(node[0]);
  }
  // 检查节点是否为有效的虚拟节点
  return isVueNode(node);
}

/**
 * 判断给定元素是否为有效的虚拟节点元素
 * @param element - 需要验证的元素，可以是任意类型
 * @returns 如果元素是有效的虚拟节点则返回true，否则返回false
 */
export function isValidElement(element: any) {
  // 如果传入的是单元素数组，则提取其中的元素进行判断
  if (Array.isArray(element) && element.length === 1) {
    element = element[0];
  }

  // 检查元素是否存在、是否为虚拟节点且类型不是symbol（排除文本节点）
  return element && element.__v_isVNode && typeof element?.type !== 'symbol'; // remove text node
}

/**
 * 判断一个值是否为组件
 *
 * @param value - 需要判断的值
 * @returns 如果是组件则返回true，否则返回false
 */
export function isComponent(value: unknown): boolean {
  // 检查值不为null，且类型为对象或函数，并且不是虚拟节点
  return value !== null && (typeof value === 'object' || typeof value === 'function') && !isVNode(value);
}

/**
 * 判断给定的子元素是否为Fragment类型
 *
 * @param child - 需要检查的子元素，可以是任意类型
 * @returns 如果child是有效的React元素且其类型为Fragment则返回true，否则返回false
 */
export function isFragment(child: any): boolean {
  // 检查child是否存在、是否为有效React元素，以及其类型是否为Fragment
  return child && isValidElement(child) && child?.type === Fragment;
}

export function isVueElement(node: VNode) {
  return isValidNode(node) && !isFragment(node);
}

type RenderProps = AnyObject | ((originProps: AnyObject) => AnyObject | undefined);

export const replaceElement = (element: any, replacement: any, props?: RenderProps) => {
  if (!isValidElement(element)) {
    return replacement;
  }
  return cloneVNode(element, typeof props === 'function' ? props(element.props || {}) : props);
};

/**
 * 判断传入的节点是否是有效的 Vue 节点
 *
 * @param node - 可能是 VNode、字符串、数字、null、undefined、函数或组件
 * @returns 如果是有效的 Vue 节点则返回 true，否则返回 false
 */
export function isVueNode(node): boolean {
  // 1. 空值判断
  if (node === null) return false;

  // 2. 如果是数组，检查其中是否有至少一个有效 VNode
  if (isArray(node)) {
    return node.some((n) => isVNode(n) && n.type !== Fragment);
  }

  // 3. 如果是函数（返回 VNode 的渲染函数）
  if (typeof node === 'function') {
    try {
      const result = (node as any)?.();
      return isVueNode(result) || isVNode(result);
    } catch {
      return false;
    }
  }

  // 4. 字符串 / 数字类型不是 VNode
  if (typeof node === 'string' || typeof node === 'number') {
    return true;
  }

  // 5. 检查是否是 VNode，且不是 Fragment
  return isVNode(node) && node.type !== Fragment;
}

export function isEmptyElement(c: any) {
  return (
    c && (c.type === Comment || (c.type === Fragment && c.children.length === 0) || (c.type === Text && c.children.trim() === ''))
  );
}

export function filterEmpty(children = []) {
  const res = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      res.push(...child);
    } else if (child?.type === Fragment) {
      res.push(...filterEmpty(child.children));
    } else {
      res.push(child);
    }
  });
  return res.filter((c) => !isEmptyElement(c));
}

export function cloneElement(element: any, props?: RenderProps) {
  return replaceElement(element, element, props) as any;
}
