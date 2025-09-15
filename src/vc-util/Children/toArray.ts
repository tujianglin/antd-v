import { Fragment, isVNode, type VNode } from 'vue';
import type { VueNode } from '../type';

export interface Option {
  keepEmpty?: boolean;
}

export function toArray(children: VueNode, option: Option = {}): VNode[] {
  const ret: VNode[] = [];

  const loop = (child: any): void => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }

    if (Array.isArray(child)) {
      child.forEach((c) => loop(c));
    } else if (isVNode(child) && child.type === Fragment && child.children) {
      // Fragment 节点，把内部 children 打平
      loop(child.children as any);
    } else {
      ret.push(child);
    }
  };

  loop(children);

  return ret;
}
