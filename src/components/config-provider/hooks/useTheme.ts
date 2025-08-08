import type { OverrideToken } from '@/components/theme/interface';
import { computed, useId, type Ref } from 'vue';
import { devUseWarning } from '../../_util/warning';
import { defaultConfig } from '../../theme/internal';
import type { ThemeConfig } from '../context';

export default function useTheme(
  theme?: Ref<ThemeConfig>,
  parentTheme?: Ref<ThemeConfig>,
  config?: {
    prefixCls?: string;
  },
): Ref<ThemeConfig | undefined> {
  const warning = devUseWarning('ConfigProvider');

  const themeConfig = computed(() => theme.value || {});
  const parentThemeConfig = computed(
    (): ThemeConfig =>
      themeConfig?.value?.inherit === false || !parentTheme?.value
        ? {
            ...defaultConfig,
            hashed: parentTheme?.value?.hashed ?? defaultConfig.hashed,
            cssVar: parentTheme?.value?.cssVar,
          }
        : parentTheme?.value,
  );

  // Generate a unique key for cssVar
  const themeKey = useId();

  if (process.env.NODE_ENV !== 'production') {
    const cssVarEnabled = themeConfig?.value?.cssVar || parentThemeConfig?.value?.cssVar;
    const validKey = !!((typeof themeConfig?.value?.cssVar === 'object' && themeConfig?.value?.cssVar?.key) || themeKey);
    warning(
      !cssVarEnabled || validKey,
      'breaking',
      'Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.',
    );
  }

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
