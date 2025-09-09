import { cloneVNode, Fragment } from 'vue';
import { isValidElement } from './isValidNode';
import type { AnyObject } from './type';

export function isFragment(child: any): boolean {
  return child && isValidElement(child) && child.type === Fragment;
}

type RenderProps = AnyObject | ((originProps: AnyObject) => AnyObject | undefined);

export const replaceElement = (element: any, replacement: any, props?: RenderProps) => {
  if (!isValidElement(element)) {
    return replacement;
  }
  return cloneVNode(element, typeof props === 'function' ? props(element.props || {}) : props);
};

export function cloneElement(element: any, props?: RenderProps) {
  return replaceElement(element, element, props) as any;
}
