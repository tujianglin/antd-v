import { computed, useId, type Ref } from 'vue';
import type { OverrideToken } from '../../theme/interface';
import { defaultConfig } from '../../theme/internal';
import type { ThemeConfig } from '../context';

export default function useTheme(
  theme?: Ref<ThemeConfig>,
  parentTheme?: Ref<ThemeConfig>,
  config?: {
    prefixCls?: string;
  },
): Ref<ThemeConfig | undefined> {
  const themeConfig = computed(() => theme.value || {});
  const parentThemeConfig = computed((): ThemeConfig => {
    return themeConfig.value.inherit === false || !parentTheme.value
      ? {
          ...defaultConfig,
          hashed: parentTheme.value?.hashed ?? defaultConfig.hashed,
          cssVar: parentTheme.value?.cssVar,
        }
      : parentTheme.value;
  });

  // Generate a unique key for cssVar
  const themeKey = useId();

  const mergedTheme = computed(() => {
    if (!theme.value) {
      return parentTheme.value;
    }
    // Override
    const mergedComponents = {
      ...parentThemeConfig.value.components,
    };

    (Object.keys(theme.value.components || {}) as (keyof OverrideToken)[]).forEach((componentName) => {
      mergedComponents[componentName] = {
        ...mergedComponents[componentName],
        ...theme.value.components![componentName],
      } as any;
    });

    const cssVarKey = `css-var-${themeKey.replace(/:/g, '')}`;
    const mergedCssVar = {
      prefix: config?.prefixCls, // Same as prefixCls by default
      ...parentThemeConfig.value.cssVar,
      ...themeConfig.value.cssVar,
      key: themeConfig.value.cssVar?.key || cssVarKey,
    };

    // Base token
    return {
      ...parentThemeConfig.value,
      ...themeConfig.value,

      token: {
        ...parentThemeConfig.value.token,
        ...themeConfig.value.token,
      },
      components: mergedComponents,
      cssVar: mergedCssVar,
    };
  });
  return mergedTheme;
}
