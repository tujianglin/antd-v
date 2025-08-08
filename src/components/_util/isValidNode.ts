import { isArray } from 'lodash-es';
import { isVNode, type VNode } from 'vue';

export default function isValidNode(node: VNode[] | VNode): boolean {
  if (isArray(node)) {
    return isVNode(node[0]);
  }
  return isVNode(node);
}

export function isValidElement(element: any) {
  if (Array.isArray(element) && element.length === 1) {
    element = element[0];
  }
  return element && element.__v_isVNode && typeof element.type !== 'symbol'; // remove text node
}
