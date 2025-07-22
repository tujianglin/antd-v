import type { Theme } from '@/vc-cssinjs';

import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  shallowRef,
  triggerRef,
  unref,
  watch,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { AliasToken, MapToken, OverrideToken, SeedToken } from './interface';
import defaultSeedToken from './themes/seed';

export { default as defaultTheme } from './themes/default/theme';

// ================================ Context =================================
// To ensure snapshot stable. We disable hashed in test env.
export const defaultConfig = reactive<DesignTokenProviderProps>({
  token: defaultSeedToken,
  override: { override: defaultSeedToken },
  hashed: false,
});

export type ComponentsToken = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    theme?: Theme<SeedToken, MapToken>;
  };
};

export interface DesignTokenProviderProps {
  token: Partial<AliasToken>;
  theme?: Theme<SeedToken, MapToken>;
  components?: ComponentsToken;
  /** Just merge `token` & `override` at top to save perf */
  override: { override: Partial<AliasToken> } & ComponentsToken;
  hashed?: boolean;
  cssVar?: {
    prefix?: string;
    key?: string;
  };
}

export const designTokenContextKey: InjectionKey<Reactive<DesignTokenProviderProps>> = Symbol('designTokenContext');
export const globalDesignTokenApi = shallowRef<DesignTokenProviderProps>();
export const useDesignTokenContextInject = () => {
  return inject(designTokenContextKey, reactive(globalDesignTokenApi.value || defaultConfig));
};

export const useDesignTokenContextProvider = (props: Reactive<DesignTokenProviderProps>) => {
  provide(designTokenContextKey, props);
  watch(
    () => props,
    (val) => {
      globalDesignTokenApi.value = unref(val) as any;
      triggerRef(globalDesignTokenApi);
    },
    { immediate: true, deep: true },
  );
};

export const DesignTokenProvider = defineComponent({
  props: {
    value: Object as PropType<DesignTokenProviderProps>,
  },
  setup(props, { slots }) {
    useDesignTokenContextProvider(reactiveComputed(() => props.value));
    return <>{slots.default?.()}</>;
  },
});
