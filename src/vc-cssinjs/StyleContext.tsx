import { getCurrentInstance, inject, provide, shallowRef, unref, watch, type InjectionKey, type Ref, type ShallowRef } from 'vue';
import CacheEntity from './Cache';
import type { Linter } from './linters/interface';
import type { Transformer } from './transformers/interface';

export const ATTR_TOKEN = 'data-token-hash';
export const ATTR_MARK = 'data-css-hash';
export const ATTR_CACHE_PATH = 'data-cache-path';

// Mark css-in-js instance in style element
export const CSS_IN_JS_INSTANCE = '__cssinjs_instance__';

export function createCache() {
  const cssinjsInstanceId = Math.random().toString(12).slice(2);

  // Tricky SSR: Move all inline style to the head.
  // PS: We do not recommend tricky mode.
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || [];
    const { firstChild } = document.head;

    Array.from(styles).forEach((style) => {
      (style as any)[CSS_IN_JS_INSTANCE] = (style as any)[CSS_IN_JS_INSTANCE] || cssinjsInstanceId;

      // Not force move if no head
      if ((style as any)[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
        document.head.insertBefore(style, firstChild);
      }
    });

    // Deduplicate of moved styles
    const styleHash: Record<string, boolean> = {};
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach((style) => {
      const hash = style.getAttribute(ATTR_MARK)!;
      if (styleHash[hash]) {
        if ((style as any)[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
          style.parentNode?.removeChild(style);
        }
      } else {
        styleHash[hash] = true;
      }
    });
  }

  return new CacheEntity(cssinjsInstanceId);
}

export type HashPriority = 'low' | 'high';

export interface StyleContextProps {
  /** @private Test only. Not work in production. */
  mock?: 'server' | 'client';
  /**
   * Only set when you need ssr to extract style on you own.
   * If not provided, it will auto create <style /> on the end of Provider in server side.
   */
  cache: CacheEntity;
  /** Tell children that this context is default generated context */
  defaultCache: boolean;
  /** Use `:where` selector to reduce hashId css selector priority */
  hashPriority?: HashPriority;
  /** Tell cssinjs where to inject style in */
  container?: Element | ShadowRoot;
  /** Component wil render inline  `<style />` for fallback in SSR. Not recommend. */
  ssrInline?: boolean;
  /** Transform css before inject in document. Please note that `transformers` do not support dynamic update */
  transformers?: Transformer[];
  /**
   * Linters to lint css before inject in document.
   * Styles will be linted after transforming.
   * Please note that `linters` do not support dynamic update.
   */
  linters?: Linter[];
  /** Wrap css in a layer to avoid global style conflict */
  layer?: boolean;
}

const getCache = () => {
  const instance = getCurrentInstance();
  let cache: CacheEntity;
  if (instance && instance.appContext) {
    const globalCache = instance.appContext?.config?.globalProperties?.__ANTDV_CSSINJS_CACHE__;
    if (globalCache) {
      cache = globalCache;
    } else {
      cache = createCache();
      if (instance.appContext.config.globalProperties) {
        instance.appContext.config.globalProperties.__ANTDV_CSSINJS_CACHE__ = cache;
      }
    }
  } else {
    cache = createCache();
  }
  return cache;
};

const StyleContextKey: InjectionKey<ShallowRef<Partial<StyleContextProps>>> = Symbol('StyleContextKey');

export type UseStyleProviderProps = Partial<StyleContextProps> | Ref<Partial<StyleContextProps>>;

export type StyleProviderProps = Partial<StyleContextProps>;

const defaultStyleContext: StyleContextProps = {
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
};

export const useStyleInject = () => {
  const cache = getCache();
  return inject(StyleContextKey, shallowRef({ ...defaultStyleContext, cache }));
};

export const useStyleProvider = (props: UseStyleProviderProps) => {
  const parentContext = useStyleInject();

  const context = shallowRef<Partial<StyleContextProps>>({
    ...defaultStyleContext,
    cache: createCache(),
  });

  watch(
    [() => unref(props), parentContext],
    ([propsValue]) => {
      const mergedContext: Partial<StyleContextProps> = {
        ...parentContext.value,
      };
      (Object.keys(propsValue) as (keyof StyleContextProps)[]).forEach((key) => {
        const value = propsValue[key];
        if (propsValue[key] !== undefined) {
          (mergedContext as any)[key] = value;
        }
      });

      const { cache } = propsValue;
      mergedContext.cache = mergedContext.cache || createCache();
      mergedContext.defaultCache = !cache && parentContext.value.defaultCache;
      context.value = mergedContext;
    },
    { immediate: true },
  );

  provide(StyleContextKey, context);
  return context;
};

export default {
  useStyleInject,
  useStyleProvider,
};
