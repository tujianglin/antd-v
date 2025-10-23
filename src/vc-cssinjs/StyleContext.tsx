import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  getCurrentInstance,
  inject,
  provide,
  reactive,
  ref,
  watch,
  type InjectionKey,
  type PropType,
  type Reactive,
  type Ref,
} from 'vue';
import CacheEntity from './Cache';
import type { Linter } from './linters/interface';
import { AUTO_PREFIX } from './transformers/autoPrefix';
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
  /** Hardcode here since transformer not support take effect on serialize currently */
  autoPrefix?: boolean;
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

const StyleContext: InjectionKey<Reactive<Partial<StyleContextProps>>> = Symbol('StyleContext');

export type UseStyleProviderProps = Partial<StyleContextProps> | Ref<Partial<StyleContextProps>>;

export type StyleProviderProps = Partial<Omit<StyleContextProps, 'autoPrefix'>>;

const defaultStyleContext: StyleContextProps = {
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
  autoPrefix: false,
};

export const useStyleContextInject = () => {
  const cache = getCache();
  return inject(StyleContext, reactive({ ...defaultStyleContext, cache }));
};

export const useStyleContextProvider = (props: Reactive<StyleContextProps>) => {
  provide(StyleContext, props);
};

export const StyleProvider = defineComponent({
  props: {
    value: Object as PropType<Partial<StyleContextProps>>,
  },
  setup(props, { slots }) {
    const parentContext = useStyleContextInject();

    const context = ref<StyleContextProps>({
      ...defaultStyleContext,
      cache: createCache(),
    });

    watch(
      [() => props.value, () => parentContext],
      ([propsValue]) => {
        const mergedContext = {
          ...parentContext,
        } as StyleContextProps;
        (Object.keys(propsValue) as (keyof StyleContextProps)[]).forEach((key) => {
          const value = propsValue[key];
          if (propsValue[key] !== undefined) {
            (mergedContext as any)[key] = value;
          }
        });

        const { cache, transformers = [] } = propsValue;
        mergedContext.cache = mergedContext.cache || createCache();
        mergedContext.defaultCache = !cache && parentContext.defaultCache;
        // autoPrefix
        if (transformers.includes(AUTO_PREFIX)) {
          mergedContext.autoPrefix = true;
        }

        context.value = mergedContext;
      },
      { immediate: true, deep: true },
    );

    useStyleContextProvider(reactiveComputed(() => context.value));
    return () => <>{slots.default?.()}</>;
  },
});
