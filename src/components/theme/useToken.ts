import type { Theme } from '@/vc-cssinjs';
import { useCacheToken } from '@/vc-cssinjs';

import { reactiveComputed } from '@vueuse/core';
import { computed, toRefs, type Reactive } from 'vue';
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
  size: true,
  sizeSM: true,
  sizeLG: true,
  sizeMD: true,
  sizeXS: true,
  sizeXXS: true,
  sizeMS: true,
  sizeXL: true,
  sizeXXL: true,
  sizeUnit: true,
  sizeStep: true,
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
export default function useToken(): Reactive<{
  theme: Theme<SeedToken, AliasToken>;
  token: GlobalToken;
  hashId: string;
  realToken: GlobalToken;
  cssVar: DesignTokenProviderProps['cssVar'];
}> {
  // const { token: rootDesignToken, hashed, theme, override, cssVar: ctxCssVar } = useDesignTokenContextInject();
  const designTokenContext = useDesignTokenContextInject();

  const cssVar = computed(() => {
    return {
      prefix: designTokenContext.value.cssVar?.prefix || 'ant',
      key: designTokenContext.value.cssVar?.key || 'css-var-root',
    };
  });

  const mergedTheme = computed(() => (designTokenContext.value.theme || defaultTheme) as Theme<SeedToken, AliasToken>);

  const { token, hashId, realToken } = toRefs(
    useCacheToken<GlobalToken, SeedToken>(
      mergedTheme,
      computed(() => [defaultSeedToken, designTokenContext.value.token]),
      computed(() => ({
        salt: `${version}-${designTokenContext.value.hashed || ''}`,
        override: designTokenContext.value.override,
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

  return reactiveComputed(() => {
    return {
      theme: mergedTheme.value,
      token: realToken.value,
      hashId: designTokenContext.value.hashed ? hashId.value : '',
      realToken: token.value,
      cssVar: cssVar.value,
    };
  });
}
