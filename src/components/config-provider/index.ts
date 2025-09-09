import { useConfigContextInject, useConfigContextProvider, Variants, type Variant } from './context';
import InternalConfigProvider from './index.vue';

export const defaultPrefixCls = 'ant';

export type { Variant };

export { Variants };

type CompoundedComponent = typeof InternalConfigProvider & {};

const ConfigProvider = InternalConfigProvider as CompoundedComponent;

export { useConfigContextInject, useConfigContextProvider };

export type { CSPConfig, ThemeConfig } from './context';
export type { ConfigProviderProps } from './interface';

export default ConfigProvider;
