import {
  useConfigContextInject,
  Variants,
  type ConfigConsumerProps,
  type CSPConfig,
  type DirectionType,
  type ThemeConfig,
  type Variant,
} from './context';
import type { RenderEmptyHandler } from './defaultRenderEmpty.vue';
import InternalConfigProvider from './index.vue';

export const defaultPrefixCls = 'ant';

export type { Variant };

export { Variants };

type CompoundedComponent = typeof InternalConfigProvider & {};

const ConfigProvider = InternalConfigProvider as CompoundedComponent;

export {
  useConfigContextInject,
  type ConfigConsumerProps,
  type CSPConfig,
  type DirectionType,
  type RenderEmptyHandler,
  type ThemeConfig,
};

export type { ConfigProviderProps } from './interface';

export default ConfigProvider;
