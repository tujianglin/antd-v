import type { Theme } from '@/vc-cssinjs';
import { useCacheToken } from '@/vc-cssinjs';

import { computed, toRefs, type Ref } from 'vue';
import version from '../version';
import type { DesignTokenProviderProps } from './context';
import { defaultTheme, useDesignTokenContextInject } from './context';
import type { AliasToken, GlobalToken, SeedToken } from './interface';
import defaultSeedToken from './themes/seed';
import formatToken from './util/alias';

export const unitless: {
  [key in keyof AliasToken]?: boolean;
} = {
  lineHeight: true,
  lineHeightSM: true,
  lineHeightLG: true,
  lineHeightHeading1: true,
  lineHeightHeading2: true,
  lineHeightHeading3: true,
  lineHeightHeading4: true,
  lineHeightHeading5: true,
  opacityLoading: true,
  fontWeightStrong: true,
  zIndexPopupBase: true,
  zIndexBase: true,
  opacityImage: true,
};

export const ignore: {
  [key in keyof AliasToken]?: boolean;
} = {
  motionBase: true,
  motionUnit: true,
};

const preserve: {
  [key in keyof AliasToken]?: boolean;
} = {
  screenXS: true,
  screenXSMin: true,
  screenXSMax: true,
  screenSM: true,
  screenSMMin: true,
  screenSMMax: true,
  screenMD: true,
  screenMDMin: true,
  screenMDMax: true,
  screenLG: true,
  screenLGMin: true,
  screenLGMax: true,
  screenXL: true,
  screenXLMin: true,
  screenXLMax: true,
  screenXXL: true,
  screenXXLMin: true,
};

export const getComputedToken = (
  originToken: SeedToken,
  overrideToken: DesignTokenProviderProps['components'] & {
    override?: Partial<AliasToken>;
  },
  theme: Theme<any, any>,
) => {
  const derivativeToken = theme.getDerivativeToken(originToken);

  const { override, ...components } = overrideToken;

  // Merge with override
  let mergedDerivativeToken = {
    ...derivativeToken,
    override,
  };

  // Format if needed
  mergedDerivativeToken = formatToken(mergedDerivativeToken);

  if (components) {
    Object.entries(components).forEach(([key, value]) => {
      const { theme: componentTheme, ...componentTokens } = value;
      let mergedComponentToken = componentTokens;
      if (componentTheme) {
        mergedComponentToken = getComputedToken(
          {
            ...mergedDerivativeToken,
            ...componentTokens,
          },
          {
            override: componentTokens,
          },
          componentTheme,
        );
      }
      mergedDerivativeToken[key] = mergedComponentToken;
    });
  }

  return mergedDerivativeToken;
};

// ================================== Hook ==================================
export default function useToken(): [
  theme: Ref<Theme<SeedToken, AliasToken>>,
  token: Ref<GlobalToken>,
  hashId: Ref<string>,
  realToken: Ref<GlobalToken>,
  cssVar: Ref<DesignTokenProviderProps['cssVar']>,
  zeroRuntime: Ref<boolean>,
] {
  const {
    token: rootDesignToken,
    hashed,
    theme,
    override,
    cssVar: ctxCssVar,
    zeroRuntime,
  } = toRefs(useDesignTokenContextInject());

  const cssVar = computed(() => {
    return {
      prefix: ctxCssVar?.value?.prefix || 'ant',
      key: ctxCssVar?.value?.key || 'css-var-root',
    };
  });

  const mergedTheme = computed(() => (theme?.value || defaultTheme) as Theme<SeedToken, AliasToken>);

  const { token, hashId, realToken } = toRefs(
    useCacheToken<GlobalToken, SeedToken>(
      mergedTheme,
      computed(() => [defaultSeedToken, rootDesignToken?.value]),
      computed(() => ({
        salt: `${version}-${hashed?.value || ''}`,
        override: override?.value,
        getComputedToken,
        cssVar: {
          ...cssVar.value,
          unitless,
          ignore,
          preserve,
        },
      })),
    ),
  );
  return [
    mergedTheme,
    realToken,
    computed(() => (hashed?.value ? hashId.value : '')),
    token,
    cssVar,
    computed(() => !!zeroRuntime?.value),
  ];
}
