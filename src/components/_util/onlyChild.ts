import { isVNode } from 'vue';

export function onlyChild(children) {
  if (children.length !== 1) {
    return console.warn(`Slot expects exactly one child, but got ${children.length}.`);
  }

  const child = children[0];

  if (!isVNode(child)) {
    return console.warn('Slot child must be a valid VNode.');
  }

  return child;
}
