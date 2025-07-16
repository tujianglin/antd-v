import type { Theme } from '@/vc-cssinjs';

import { computed, inject, provide, shallowRef, triggerRef, unref, watch, type ComputedRef, type InjectionKey } from 'vue';
import type { AliasToken, MapToken, OverrideToken, SeedToken } from './interface';
import defaultSeedToken from './themes/seed';

export { default as defaultTheme } from './themes/default/theme';

// ================================ Context =================================
// To ensure snapshot stable. We disable hashed in test env.
export const defaultConfig: DesignTokenProviderProps = {
  token: defaultSeedToken,
  override: { override: defaultSeedToken },
  hashed: false,
};

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

export const designTokenContextKey: InjectionKey<ComputedRef<DesignTokenProviderProps>> = Symbol('designTokenContext');
export const globalDesignTokenApi = shallowRef<DesignTokenProviderProps>();
export const useDesignTokenContextInject = () => {
  return inject(
    designTokenContextKey,
    computed(() => globalDesignTokenApi.value || defaultConfig),
  );
};

export const useDesignTokenContextProvider = (props: ComputedRef<DesignTokenProviderProps>) => {
  provide(designTokenContextKey, props);
  watch(
    props,
    () => {
      globalDesignTokenApi.value = unref(props);
      triggerRef(globalDesignTokenApi);
    },
    { immediate: true, deep: true },
  );
};
