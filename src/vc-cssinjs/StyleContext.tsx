import type { ComputedRef, InjectionKey } from 'vue';
import { computed, defineComponent, getCurrentInstance, inject, provide } from 'vue';
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
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || [];
    const { firstChild } = document.head;

    Array.from(styles).forEach((style) => {
      (style as any)[CSS_IN_JS_INSTANCE] ||= cssinjsInstanceId;

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
  cache: CacheEntity;
  defaultCache: boolean;
  hashPriority?: HashPriority;
  container?: Element | ShadowRoot;
  ssrInline?: boolean;
  transformers?: Transformer[];
  linters?: Linter[];
  layer?: boolean;
  autoPrefix?: boolean;
}

const defaultStyleContext: StyleContextProps = {
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
  autoPrefix: false,
};

export const StyleContextKey: InjectionKey<ComputedRef<StyleContextProps>> = Symbol('StyleContext');

// 缓存组件实例的 styleContext，避免在 render 中重复 inject
const styleContextCache = new WeakMap<object, ComputedRef<StyleContextProps>>();

// 全局默认 context，用于在没有组件实例时返回
let globalDefaultContext: ComputedRef<StyleContextProps> | null = null;

export function useStyleContext(): ComputedRef<StyleContextProps> {
  const instance = getCurrentInstance();

  // 如果有组件实例，尝试从缓存获取
  if (instance) {
    const cached = styleContextCache.get(instance);
    if (cached) {
      return cached;
    }

    // 首次调用，执行 inject
    const context = inject(
      StyleContextKey,
      computed(() => defaultStyleContext),
    );

    // 缓存结果
    styleContextCache.set(instance, context);
    // 同时更新全局默认 context
    globalDefaultContext = context;

    return context;
  }

  // 没有组件实例时（如在 watchEffect/computed 回调中），返回全局缓存的 context
  if (globalDefaultContext) {
    return globalDefaultContext;
  }

  // 兜底：返回默认 context
  return computed(() => defaultStyleContext);
}

export interface StyleProviderProps {
  mock?: 'server' | 'client';
  cache?: CacheEntity;
  hashPriority?: HashPriority;
  container?: Element | ShadowRoot;
  ssrInline?: boolean;
  transformers?: Transformer[];
  linters?: Linter[];
  layer?: boolean;
}

export const StyleProvider = defineComponent({
  name: 'StyleProvider',
  props: {
    mock: String as () => 'server' | 'client',
    cache: Object as () => CacheEntity,
    hashPriority: String as () => HashPriority,
    container: Object as () => Element | ShadowRoot,
    ssrInline: Boolean,
    transformers: Array as () => Transformer[],
    linters: Array as () => Linter[],
    layer: Boolean,
  },
  setup(props, { slots }) {
    const parentContext = useStyleContext();

    const context = computed<StyleContextProps>(() => {
      const mergedContext: StyleContextProps = {
        ...parentContext.value,
      };

      const keys: (keyof StyleProviderProps)[] = [
        'mock',
        'cache',
        'hashPriority',
        'container',
        'ssrInline',
        'transformers',
        'linters',
        'layer',
      ];

      keys.forEach((key) => {
        const value = props[key];
        if (value !== undefined) {
          (mergedContext as any)[key] = value;
        }
      });

      const { cache, transformers = [] } = props;
      mergedContext.cache = mergedContext.cache || createCache();
      mergedContext.defaultCache = !cache && parentContext.value.defaultCache;

      // autoPrefix
      if (transformers.includes(AUTO_PREFIX as any)) {
        mergedContext.autoPrefix = true;
      }

      return mergedContext;
    });

    provide(StyleContextKey, context);

    return () => slots.default?.();
  },
});

export default {
  useStyleContext,
  StyleProvider,
  createCache,
};
