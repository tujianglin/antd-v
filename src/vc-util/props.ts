import { Fragment } from 'vue';

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
