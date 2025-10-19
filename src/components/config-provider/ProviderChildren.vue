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
import MotionWrapper from './MotionWrapper.vue';

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  legacyLocale: Locale;
}

const {
  csp: customCsp,
  alert,
  affix,
  anchor,
  // form,
  locale,
  componentSize,
  direction,
  space,
  splitter,
  virtual,
  popupMatchSelectWidth,
  popupOverflow,
  legacyLocale,
  parentContext,
  iconPrefixCls: customIconPrefixCls,
  theme,
  componentDisabled,
  segmented,
  statistic,
  // spin,
  calendar,
  carousel,
  cascader,
  // collapse,
  typography,
  checkbox,
  descriptions,
  divider,
  // drawer,
  // skeleton,
  steps,
  image,
  layout,
  mentions,
  // modal,
  progress,
  result,
  slider,
  breadcrumb,
  // masonry,
  menu,
  pagination,
  input,
  textArea,
  otp,
  empty,
  badge,
  radio,
  rate,
  // ribbon,
  switch: SWITCH,
  transfer,
  avatar,
  message,
  tag,
  // table,
  card,
  // cardMeta,
  tabs,
  timeline,
  timePicker,
  upload,
  notification,
  tree,
  colorPicker,
  datePicker,
  rangePicker,
  flex,
  wave,
  dropdown,
  warning: warningConfig,
  // tour,
  tooltip,
  popover,
  popconfirm,
  qrcode,
  floatButton,
  floatButtonGroup,
  variant,
  inputNumber,
  treeSelect,
  watermark,
} = defineProps<ProviderChildrenProps>();

const vm = getCurrentInstance() as unknown as { props: ProviderChildrenProps };

// =================================== Context ===================================
const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
  const { prefixCls } = vm.props;

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
  space,
  splitter,
  virtual,
  popupMatchSelectWidth,
  popupOverflow,
  getPrefixCls,
  iconPrefixCls,
  theme: mergedTheme,
  segmented,
  statistic,
  // spin,
  calendar,
  carousel,
  cascader,
  // collapse,
  typography,
  checkbox,
  descriptions,
  divider,
  // drawer,
  // skeleton,
  steps,
  image,
  input,
  textArea,
  otp,
  layout,
  mentions,
  // modal,
  progress,
  result,
  slider,
  breadcrumb,
  // masonry,
  menu,
  pagination,
  empty,
  badge,
  radio,
  rate,
  // ribbon,
  switch: SWITCH,
  transfer,
  avatar,
  message,
  tag,
  // table,
  card,
  // cardMeta,
  tabs,
  timeline,
  timePicker,
  upload,
  notification,
  tree,
  colorPicker,
  datePicker,
  rangePicker,
  flex,
  wave,
  dropdown,
  warning: warningConfig,
  // tour,
  tooltip,
  popover,
  popconfirm,
  qrcode,
  floatButton,
  floatButtonGroup,
  variant,
  inputNumber,
  treeSelect,
  watermark,
}));

const memoedConfig = computed(() => {
  const props = vm.props as any;
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

// const styleInject = useStyleInject();
// const { layer } = toRefs(reactiveComputed(() => styleInject.value));

// const memoIconContextValue = computed(() => ({
//   prefixCls: iconPrefixCls?.value,
//   csp: csp?.value,
//   layer: layer?.value ? 'antd' : undefined,
// }));

// const validateMessages = computed(() =>
//   merge(
//     defaultLocale.Form?.defaultValidateMessages || {},
//     memoedConfig?.value?.locale?.Form?.defaultValidateMessages || {},
// memoedConfig?.value?.form?.validateMessages || {},
// form?.validateMessages || {},
//   ),
// );
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

  // if (iconPrefixCls.value || csp.value) {
  // result = <IconContextProvider value={memoIconContextValue}>{childNode}</IconContextProvider>;
  // }

  if (componentSize) {
    result = <SizeContextProvider size={componentSize}>{result}</SizeContextProvider>;
  }

  result = <MotionWrapper>{result}</MotionWrapper>;

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
