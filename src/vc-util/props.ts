import { Fragment, isVNode } from 'vue';

export function falseToUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === false ? undefined : value]));
}
export const skipFlattenKey = Symbol('skipFlatten');

export function isEmptyElement(c: any) {
  return (
    c && (c.type === Comment || (c.type === Fragment && c.children.length === 0) || (c.type === Text && c.children.trim() === ''))
  );
}

export function isValid(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}
export const flattenChildren = (children = [], filterEmpty = true) => {
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
