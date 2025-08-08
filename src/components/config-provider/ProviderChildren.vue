<script lang="tsx" setup>
import { createTheme } from '@/vc-cssinjs';
import { computed, getCurrentInstance, useSlots } from 'vue';
import { ANT_MARK, LocaleProvider, type Locale } from '../locale';
import { ConfigContextProvider, defaultIconPrefixCls, type ConfigConsumerProps } from './context';
import useTheme from './hooks/useTheme';
import { PASSED_PROPS, type ConfigProviderProps } from './interface';
import useStyle from './style';
import { SizeContextProvider } from './SizeContext';
import { defaultTheme, DesignTokenContextProvider } from '../theme/context';
import defaultSeedToken from '../theme/themes/seed';
import { DisabledContextProvider } from './DisabledContext';

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  legacyLocale: Locale;
}

const {
  csp: customCsp,
  // alert,
  affix,
  anchor,
  // form,
  locale,
  componentSize,
  direction,
  // space,
  splitter,
  virtual,
  popupMatchSelectWidth,
  // popupOverflow,
  legacyLocale,
  parentContext,
  iconPrefixCls: customIconPrefixCls,
  theme,
  componentDisabled,
  segmented,
  statistic,
  calendar,
  carousel,
  typography,
  descriptions,
  divider,
  steps,
  layout,
  progress,
  result,
  slider,
  breadcrumb,
  rate,
  switch: SWITCH,
  avatar,
  upload,
  tree,
  colorPicker,
  watermark,
  prefixCls,
} = defineProps<ProviderChildrenProps>();

// =================================== Context ===================================
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
  { prefixCls: getPrefixCls('') },
);

const baseConfig = computed(() => ({
  csp,
  alert,
  affix,
  anchor,
  locale: locale || legacyLocale,
  direction,
  splitter,
  virtual,
  popupMatchSelectWidth,
  getPrefixCls,
  iconPrefixCls,
  theme: mergedTheme,
  segmented,
  statistic,
  calendar,
  carousel,
  typography,
  descriptions,
  divider,
  steps,
  layout,
  progress,
  result,
  slider,
  breadcrumb,
  rate,
  switch: SWITCH,
  avatar,
  upload,
  tree,
  colorPicker,
  watermark,
}));

const wm = getCurrentInstance();

const memoedConfig = computed(() => {
  const props = wm.props as any;
  const config: ConfigConsumerProps = { ...parentContext };

  (Object.keys(baseConfig.value) as (keyof typeof baseConfig.value)[]).forEach((key) => {
    if (baseConfig.value[key] !== undefined) {
      (config as any)[key] = baseConfig.value[key];
    }
  });

  // Pass the props used by `useContext` directly with child component.
  // These props should merged into `config`.
  PASSED_PROPS.forEach((propName) => {
    const propValue = props[propName];
    if (propValue) {
      (config as any)[propName] = propValue;
    }
  });

  return config;
});

// const { layer } = toRefs(useStyleContextInject());

// const memoIconContextValue = computed(() => ({ prefixCls: iconPrefixCls, csp, layer: layer?.value ? 'antd' : undefined }));

// ================================ Dynamic theme ================================
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

const slots = useSlots();
const childNode = () => {
  let result = slots.default?.() as any;
  if (locale) {
    result = (
      <LocaleProvider locale={locale} _ANT_MARK__={ANT_MARK}>
        {result}
      </LocaleProvider>
    );
  }
  if (componentSize) {
    result = <SizeContextProvider size={componentSize}>{result}</SizeContextProvider>;
  }

  if (theme) {
    result = <DesignTokenContextProvider value={memoTheme.value}>{result}</DesignTokenContextProvider>;
  }
  if (componentDisabled !== undefined) {
    result = <DisabledContextProvider disabled={componentDisabled}>{result}</DisabledContextProvider>;
  }
  return result;
};
</script>
<template>
  <ConfigContextProvider :value="memoedConfig">
    <component :is="childNode()" />
  </ConfigContextProvider>
</template>
