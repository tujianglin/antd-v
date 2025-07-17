import { camelCase } from 'lodash-es';
import type { Component, FunctionalComponent, VNode } from 'vue';
import { Fragment, isVNode } from 'vue';

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends string> = T | (string & {});

export type AnyObject = Record<PropertyKey, any>;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
declare type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;

export type VueNode = VNodeChildAtom | VNodeChildAtom[] | VNode;

export type RenderNode = (() => any) | Component | VNode | string | number;

export type HTMLTagName = keyof HTMLElementTagNameMap;

export type CustomComponent =
  | HTMLTagName // e.g., 'div', 'span'
  | Component // Vue component
  | FunctionalComponent;

export function isComponent(value: unknown): boolean {
  return value !== null && (typeof value === 'object' || typeof value === 'function') && !isVNode(value);
}

export function propsToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = camelCase(key);
      result[camelKey] = obj[key];
    }
  }

  return result;
}

export function extractValidChildren(vnodes: VNode[] = []): VNode[] {
  const result: VNode[] = [];

  vnodes.forEach((vnode) => {
    // 忽略 key 为 _default 的
    if (vnode?.key === '_default') {
      if (vnode.type === Fragment) {
        // 递归展开 Fragment 的 children
        if (Array.isArray(vnode.children)) {
          result.push(...extractValidChildren(vnode.children as VNode[]));
        }
      } else if (isVNode(vnode)) {
        result.push(vnode);
      }
    } else {
      if (vnode.type === Fragment) {
        // 递归展开 Fragment 的 children
        if (Array.isArray(vnode.children)) {
          result.push(...extractValidChildren(vnode.children as VNode[]));
        }
      } else if (isVNode(vnode)) {
        result.push(vnode);
      }
    }
  });
  return result;
}
