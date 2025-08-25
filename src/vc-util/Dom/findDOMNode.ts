import { Fragment, isVNode, type VNode } from 'vue';
import { isEmptyElement, isValid } from '../props';

export default function findDOMNode(instance: any): HTMLDivElement {
  let node = instance?.vnode?.el || (instance && (instance.$el || instance));
  while (node && !node.tagName) {
    node = node.nextSibling;
  }
  return node;
}

export const skipFlattenKey = Symbol('skipFlatten');
export const flattenChildren = (children = [], filterEmpty = true): VNode[] => {
  const temp = Array.isArray(children) ? children : [children];
  const res = [];
  temp.forEach((child) => {
    if (Array.isArray(child)) {
      res.push(...flattenChildren(child, filterEmpty));
    } else if (child && child.type === Fragment) {
      if (child.key === skipFlattenKey) {
        res.push(child);
      } else {
        res.push(...flattenChildren(child.children, filterEmpty));
      }
    } else if (child && isVNode(child)) {
      if (filterEmpty && !isEmptyElement(child)) {
        res.push(child);
      } else if (!filterEmpty) {
        res.push(child);
      }
    } else if (isValid(child)) {
      res.push(child);
    }
  });
  return res;
};

export function isDOM(node: any): node is HTMLElement | SVGElement {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement;
}

/**
 * Retrieves a DOM node via a ref, and does not invoke `findDOMNode`.
 */
export function getDOM(node: any): HTMLElement | SVGElement | null {
  if (node && typeof node === 'object' && isDOM(node.nativeElement)) {
    return node.nativeElement;
  }

  if (isDOM(node)) {
    return node as any;
  }

  return null;
}
