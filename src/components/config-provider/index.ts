import { useConfigContextInject, useConfigContextProvider } from './context';
import InternalConfigProvider from './index.vue';

type CompoundedComponent = typeof InternalConfigProvider & {};

const ConfigProvider = InternalConfigProvider as CompoundedComponent;

export { ConfigProvider, useConfigContextInject, useConfigContextProvider };

export type { CSPConfig } from './context';
export type { ConfigProviderProps } from './interface';
