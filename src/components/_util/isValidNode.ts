import { isArray } from 'lodash-es';
import { isVNode, type VNode } from 'vue';

export default function isValidNode(node: VNode[] | VNode): boolean {
  if (isArray(node)) {
    return isVNode(node[0]);
  }
  return isVNode(node);
}
