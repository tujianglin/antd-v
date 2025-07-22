import isValidNode from '@/components/_util/isValidNode';
import { Fragment, type VNode } from 'vue';

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
