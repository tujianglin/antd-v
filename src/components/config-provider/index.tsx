import type { ConfigConsumerProps, CSPConfig, DirectionType, ThemeConfig } from './context';
import ConfigProvider from './index.vue';

import { defaultIconPrefixCls, defaultPrefixCls, useConfigContextInject, useConfigContextProvider } from './context';

export {
  defaultIconPrefixCls,
  defaultPrefixCls,
  useConfigContextInject,
  useConfigContextProvider,
  type ConfigConsumerProps,
  type CSPConfig,
  type DirectionType,
  type ThemeConfig,
};

export default ConfigProvider;
