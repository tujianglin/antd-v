import { toRefs } from 'vue';
import DesignTokenProvider from './DesignTokenProvider.vue';
import getDesignToken from './getDesignToken';
import type { GlobalToken, MappingAlgorithm } from './interface';
import { defaultConfig, useDesignTokenContextInject, useToken as useInternalToken } from './internal';
import compactAlgorithm from './themes/compact';
import darkAlgorithm from './themes/dark';
import defaultAlgorithm from './themes/default';

// ZombieJ: We export as object to user but array in internal.
// This is used to minimize the bundle size for antd package but safe to refactor as object also.
// Please do not export internal `useToken` directly to avoid something export unexpected.
/** Get current context Design Token. Will be different if you are using nest theme config. */
function useToken() {
  return toRefs(useInternalToken());
}

export type { GlobalToken, MappingAlgorithm };

export default {
  /** Default seedToken */
  defaultSeed: defaultConfig.token,
  DesignTokenProvider,
  useToken,
  defaultAlgorithm,
  darkAlgorithm,
  compactAlgorithm,
  getDesignToken,
  /**
   * @private Private variable
   * @warring 🔥 Do not use in production. 🔥
   */
  defaultConfig,
  /**
   * @private Private variable
   * @warring 🔥 Do not use in production. 🔥
   */
  _internalContext: useDesignTokenContextInject,
};
