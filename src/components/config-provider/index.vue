<script lang="tsx" setup>
import { createTheme } from '@/vc-cssinjs';
import { computed, useSlots } from 'vue';
import { defaultTheme } from '../theme/context';
import defaultSeedToken from '../theme/themes/seed';
import { defaultIconPrefixCls, useConfigContextInject, useConfigContextProvider } from './context';
import useTheme from './hooks/useTheme';
import type { ConfigProviderProps } from './interface';
import useStyle from './style';
import DesignTokenProvider from '../theme/DesignTokenProvider.vue';
import { reactiveComputed } from '@vueuse/core';

defineOptions({ name: 'ConfigProvider' });

const {
  csp: customCsp,
  iconPrefixCls: customIconPrefixCls,
  prefixCls,
  button,
  theme = {},
  wave = { disabled: false },
} = defineProps<ConfigProviderProps>();

const parentContext = useConfigContextInject();

const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }

  const mergedPrefixCls = prefixCls || parentContext.getPrefixCls('');

  return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
};

const iconPrefixCls = computed(() => customIconPrefixCls || parentContext.iconPrefixCls || defaultIconPrefixCls);
const csp = computed(() => customCsp || parentContext.csp);

useStyle(iconPrefixCls, csp);

const mergedTheme = useTheme(
  computed(() => theme),
  computed(() => parentContext.theme),
  computed(() => ({ prefixCls: getPrefixCls('') })),
);

const baseConfig = reactiveComputed(() => ({
  csp: csp.value,
  getPrefixCls,
  iconPrefixCls: iconPrefixCls.value,
  theme: mergedTheme?.value ?? parentContext.theme,
  button,
  wave,
}));

const memoTheme = computed(() => {
  const { algorithm, token, components, cssVar, ...rest } = mergedTheme.value || {};
  const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? createTheme(algorithm) : defaultTheme;

  const parsedComponents: any = {};
  Object.entries(components || {}).forEach(([componentName, componentToken]) => {
    const parsedToken: typeof componentToken & { theme?: typeof defaultTheme } = {
      ...componentToken,
    };
    if ('algorithm' in parsedToken) {
      if (parsedToken.algorithm === true) {
        parsedToken.theme = themeObj;
      } else if (Array.isArray(parsedToken.algorithm) || typeof parsedToken.algorithm === 'function') {
        parsedToken.theme = createTheme(parsedToken.algorithm);
      }
      delete parsedToken.algorithm;
    }
    parsedComponents[componentName] = parsedToken;
  });

  const mergedToken = {
    ...defaultSeedToken,
    ...token,
  };

  return {
    ...rest,
    theme: themeObj,

    token: mergedToken,
    components: parsedComponents,
    override: {
      override: mergedToken,
      ...parsedComponents,
    },
    cssVar,
  };
});

useConfigContextProvider(baseConfig);

const slots = useSlots();

const renderProvider = () => {
  const childNode = slots.default?.();
  if (theme) return <DesignTokenProvider value={memoTheme.value}>{childNode}</DesignTokenProvider>;
  return <>{childNode}</>;
};
</script>
<template>
  <renderProvider />
</template>
