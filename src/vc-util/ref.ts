import isValidNode from '@/components/_util/isValidNode';
import { Fragment, isVNode, type VNode } from 'vue';

export function isFragment(node: VNode): boolean {
  return node.type === Fragment;
}

export function isVueElement(node: VNode) {
  return isValidNode(node) && !isFragment(node);
}

export function getVNodeRef(vnode: VNode | null | undefined) {
  if (!vnode) return null;
  return vnode.ref || null;
}

export function getNodeRef(node: unknown) {
  if (isVNode(node)) {
    // Vue 3 中 VNode.ref 可能是字符串（template ref）或 Ref 对象
    return node.ref ?? null;
  }
  return null;
}

export function supportRef(nodeOrComponent: unknown): boolean {
  if (!nodeOrComponent) return false;

  if (isVNode(nodeOrComponent)) {
    const vnode = nodeOrComponent as VNode;

    // 原生 HTML 元素
    if (typeof vnode.type === 'string') {
      return true;
    }

    // 有状态组件
    if (typeof vnode.type === 'object' || typeof vnode.type === 'function') {
      return true;
    }

    // 函数式组件（Vue 中函数式组件没有实例，不支持 ref）
    return false;
  }

  // 如果直接是组件选项对象（非 VNode）
  if (typeof nodeOrComponent === 'object' || typeof nodeOrComponent === 'function') {
    // setup / render 存在就有实例
    if ('setup' in (nodeOrComponent as any) || 'render' in (nodeOrComponent as any)) {
      return true;
    }
  }

  return false;
}

export const supportNodeRef = (node: any) => {
  return isVueElement(node) && supportRef(node);
};
/**
 * Merge refs into one ref function to support ref passing.
 */
export function composeRef(...refs) {
  return (el) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.value = el;
      }
    });
  };
}

// 在全局维护活跃 popup 列表
export const activePopups = new Map<HTMLElement, (e: MouseEvent) => void>();

export function registerPopup(el: HTMLElement, fn) {
  activePopups.set(el, fn);
  return () => activePopups.delete(el);
}
