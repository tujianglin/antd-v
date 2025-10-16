import type { VueKey } from '@/vc-util/type';
import { assign, camelCase } from 'lodash-es';
import type { Component, FunctionalComponent, Ref, VNode } from 'vue';
import { Fragment, getCurrentInstance, isVNode } from 'vue';

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends string> = T | (string & {});

export type AnyObject = Record<VueKey, any>;

export type HTMLTagName = keyof HTMLElementTagNameMap;

export type CustomComponent =
  | HTMLTagName // e.g., 'div', 'span'
  | Component // Vue component
  | FunctionalComponent;

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

export const toUnrefProps = (refs: Record<string, any>) => {
  const unrefed: Record<string, any> = {};
  for (const key in refs) {
    unrefed[key] = refs[key].value;
  }
  return unrefed;
};

export const useComposeRef = (expose?: Record<string, any>, ref?: Ref<any>) => {
  const vm = getCurrentInstance();

  const changeRef = (instacne) => {
    if (ref) {
      ref.value = instacne;
    }
    vm.exposed = assign(instacne || {}, expose);
    vm.exposeProxy = assign(instacne || {}, expose);
  };

  return changeRef;
};
