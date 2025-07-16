import type { CSSInterpolation, CSSObject, TokenType } from '@/vc-cssinjs';

import { token2CSSVar, useCSSVarRegister, useStyleRegister } from '@/vc-cssinjs';

import type { ComponentTokenKey, GlobalTokenWithComponent, TokenMap, TokenMapKey } from '../interface';

import type AbstractCalculator from './calc/calculator';

import genCalc from './calc';
import getCompVarPrefix from './getCompVarPrefix';
import getComponentToken from './getComponentToken';
import getDefaultComponentToken from './getDefaultComponentToken';
import genMaxMin from './maxmin';
import statisticToken, { merge as mergeToken } from './statistic';

import { computed } from 'vue';
import useUniqueMemo from '../_util/hooks/useUniqueMemo';
import type { UseCSP } from '../hooks/useCSP';
import useDefaultCSP from '../hooks/useCSP';
import type { UsePrefix } from '../hooks/usePrefix';
import type { UseToken } from '../hooks/useToken';

type LayerConfig = Parameters<typeof useStyleRegister>[0]['value']['layer'];

export interface StyleInfo {
  hashId: string;
  prefixCls: string;
  rootPrefixCls: string;
  iconPrefixCls: string;
}

export type CSSUtil = {
  calc: (number: any) => AbstractCalculator;
  max: (...values: (number | string)[]) => number | string;
  min: (...values: (number | string)[]) => number | string;
};

export type TokenWithCommonCls<T> = T & {
  /** Wrap component class with `.` prefix */
  componentCls: string;
  /** Origin prefix which do not have `.` prefix */
  prefixCls: string;
  /** Wrap icon class with `.` prefix */
  iconCls: string;
  /** Wrap ant prefixCls class with `.` prefix */
  antCls: string;
} & CSSUtil;

export type FullToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = TokenWithCommonCls<GlobalTokenWithComponent<CompTokenMap, AliasToken, C>>;

export type GenStyleFn<CompTokenMap extends TokenMap, AliasToken extends TokenType, C extends TokenMapKey<CompTokenMap>> = (
  token: FullToken<CompTokenMap, AliasToken, C>,
  info: StyleInfo,
) => CSSInterpolation;

export type GetDefaultTokenFn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = (token: AliasToken & Partial<CompTokenMap[C]>) => CompTokenMap[C];

export type GetDefaultToken<CompTokenMap extends TokenMap, AliasToken extends TokenType, C extends TokenMapKey<CompTokenMap>> =
  | null
  | CompTokenMap[C]
  | GetDefaultTokenFn<CompTokenMap, AliasToken, C>;

export interface SubStyleComponentProps {
  prefixCls: string;
  rootCls?: string;
}

export type CSSVarRegisterProps = {
  rootCls: string;
  component: string;
  cssVar: {
    prefix?: string;
    key?: string;
  };
};

type GetResetStylesConfig = {
  prefix: ReturnType<UsePrefix>;
  csp: ReturnType<UseCSP>;
};

export type GetResetStyles<AliasToken extends TokenType> = (token: AliasToken, config?: GetResetStylesConfig) => CSSInterpolation;

export type GetCompUnitless<CompTokenMap extends TokenMap, AliasToken extends TokenType> = <C extends TokenMapKey<CompTokenMap>>(
  component: C | [C, string],
) => Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;

function genStyleUtils<CompTokenMap extends TokenMap, AliasToken extends TokenType, DesignToken extends TokenType>(config: {
  usePrefix: UsePrefix;
  useToken: UseToken<CompTokenMap, AliasToken, DesignToken>;
  useCSP?: UseCSP;
  getResetStyles?: GetResetStyles<AliasToken>;
  getCommonStyle?: (token: AliasToken, componentPrefixCls: string, rootCls?: string, resetFont?: boolean) => CSSObject;
  getCompUnitless?: GetCompUnitless<CompTokenMap, AliasToken>;
  layer?: LayerConfig;
}) {
  // Dependency inversion for preparing basic config.
  const { useCSP = useDefaultCSP, useToken, usePrefix, getResetStyles, getCommonStyle, getCompUnitless } = config;

  function genStyleHooks<C extends TokenMapKey<CompTokenMap>>(
    component: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options?: {
      resetStyle?: boolean;
      resetFont?: boolean;
      deprecatedTokens?: [ComponentTokenKey<CompTokenMap, AliasToken, C>, ComponentTokenKey<CompTokenMap, AliasToken, C>][];
      /**
       * Component tokens that do not need unit.
       */
      unitless?: Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      /**
       * Set order of component style.
       * @default -999
       */
      order?: number;
      /**
       * Whether generate styles
       * @default true
       */
      injectStyle?: boolean;
    },
  ) {
    const componentName = Array.isArray(component) ? component[0] : component;

    function prefixToken(key: string) {
      return `${String(componentName)}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
    }

    // Fill unitless
    const originUnitless = options?.unitless || {};

    const originCompUnitless = typeof getCompUnitless === 'function' ? getCompUnitless(component) : {};

    const compUnitless: any = {
      ...originCompUnitless,
      [prefixToken('zIndexPopup')]: true,
    };
    Object.keys(originUnitless).forEach((key) => {
      compUnitless[prefixToken(key)] = originUnitless[key as keyof ComponentTokenKey<CompTokenMap, AliasToken, C>];
    });

    // Options
    const mergedOptions = {
      ...options,
      unitless: compUnitless,
      prefixToken,
    };

    // Hooks
    const useStyle = genComponentStyleHook(component, styleFn, getDefaultToken, mergedOptions);

    const useCSSVar = genCSSVarRegister(componentName, getDefaultToken, mergedOptions);

    return (prefixCls: string, rootCls: string = prefixCls) => {
      const hashId = useStyle(prefixCls, rootCls);
      const cssVarCls = useCSSVar(rootCls);
      return [hashId, cssVarCls] as const;
    };
  }

  function genCSSVarRegister<C extends TokenMapKey<CompTokenMap>>(
    component: C,
    getDefaultToken: GetDefaultToken<CompTokenMap, AliasToken, C> | undefined,
    options: {
      unitless?: Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;
      ignore?: Partial<Record<keyof AliasToken, boolean>>;
      deprecatedTokens?: [ComponentTokenKey<CompTokenMap, AliasToken, C>, ComponentTokenKey<CompTokenMap, AliasToken, C>][];
      injectStyle?: boolean;
      prefixToken: (key: string) => string;
    },
  ) {
    const { unitless: compUnitless, prefixToken, ignore } = options;

    return (rootCls: string) => {
      const { cssVar, realToken } = useToken();

      useCSSVarRegister(
        {
          path: [component],
          prefix: cssVar.value.prefix,
          key: cssVar.value.key!,
          unitless: compUnitless,
          ignore,
          token: realToken,
          scope: rootCls,
        },
        () => {
          const defaultToken = getDefaultComponentToken<CompTokenMap, AliasToken, C>(component, realToken.value, getDefaultToken);
          const componentToken = getComponentToken<CompTokenMap, AliasToken, C>(component, realToken.value, defaultToken, {
            deprecatedTokens: options?.deprecatedTokens,
          });
          if (defaultToken) {
            Object.keys(defaultToken).forEach((key) => {
              componentToken[prefixToken(key)] = componentToken[key];
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete componentToken[key];
            });
          }
          return componentToken;
        },
      );

      return cssVar.value?.key;
    };
  }

  function genComponentStyleHook<C extends TokenMapKey<CompTokenMap>>(
    componentName: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options: {
      resetStyle?: boolean;
      resetFont?: boolean;
      // Deprecated token key map [["oldTokenKey", "newTokenKey"], ["oldTokenKey", "newTokenKey"]]
      deprecatedTokens?: [ComponentTokenKey<CompTokenMap, AliasToken, C>, ComponentTokenKey<CompTokenMap, AliasToken, C>][];
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      /**
       * Set order of component style. Default is -999.
       */
      order?: number;
      injectStyle?: boolean;
      unitless?: Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;
    } = {},
  ) {
    const cells = (Array.isArray(componentName) ? componentName : [componentName, componentName]) as [C, string];

    const [component] = cells;
    const concatComponent = cells.join('-');

    const mergedLayer = config.layer || {
      name: 'antd',
    };

    // Return new style hook
    return (prefixCls: string, rootCls: string = prefixCls): string => {
      const { theme, realToken, hashId, token, cssVar, zeroRuntime } = useToken();
      // Update of `disabledRuntimeStyle` would cause React hook error, so memoized it and never update.
      const memoizedZeroRuntime = computed(() => zeroRuntime);
      if (memoizedZeroRuntime.value) {
        return hashId.value;
      }

      const { rootPrefixCls, iconPrefixCls } = usePrefix();
      const csp = useCSP();

      const type = 'css';
      // Use unique memo to share the result across all instances
      const calc = useUniqueMemo(() => {
        const unitlessCssVar = new Set<string>();
        Object.keys(options.unitless || {}).forEach((key) => {
          // Some component proxy the AliasToken (e.g. Image) and some not (e.g. Modal)
          // We should both pass in `unitlessCssVar` to make sure the CSSVar can be unitless.
          unitlessCssVar.add(token2CSSVar(key, cssVar.value.prefix));
          unitlessCssVar.add(token2CSSVar(key, getCompVarPrefix(component, cssVar.value.prefix)));
        });

        return genCalc(type, unitlessCssVar);
      }, [type, component, cssVar.value?.prefix]);

      const { max, min } = genMaxMin(type);

      // Shared config
      const sharedConfig: Omit<Parameters<typeof useStyleRegister>[0]['value'], 'path'> = {
        theme: theme.value,
        token,
        hashId: hashId.value,
        nonce: () => csp.nonce!,
        clientOnly: options.clientOnly,
        layer: mergedLayer,

        // antd is always at top of styles
        order: options.order || -999,
      };

      // This if statement is safe, as it will only be used if the generator has the function. It's not dynamic.
      if (typeof getResetStyles === 'function') {
        // Generate style for all need reset tags.
        useStyleRegister(
          computed(() => ({ ...sharedConfig, clientOnly: false, path: ['Shared', rootPrefixCls] })),
          () => getResetStyles(token.value, { prefix: { rootPrefixCls, iconPrefixCls }, csp }),
        );
      }

      useStyleRegister(
        computed(() => ({ ...sharedConfig, path: [concatComponent, prefixCls, iconPrefixCls] })),
        () => {
          if (options.injectStyle === false) {
            return [];
          }

          const { token: proxyToken, flush } = statisticToken(token);

          const defaultComponentToken = getDefaultComponentToken<CompTokenMap, AliasToken, C>(
            component,
            realToken.value,
            getDefaultToken,
          );

          const componentCls = `.${prefixCls}`;
          const componentToken = getComponentToken<CompTokenMap, AliasToken, C>(
            component,
            realToken.value,
            defaultComponentToken,
            {
              deprecatedTokens: options.deprecatedTokens,
            },
          );

          if (defaultComponentToken && typeof defaultComponentToken === 'object') {
            Object.keys(defaultComponentToken).forEach((key) => {
              defaultComponentToken[key] = `var(${token2CSSVar(key, getCompVarPrefix(component, cssVar.value.prefix))})`;
            });
          }
          const mergedToken = mergeToken<any>(
            proxyToken.value,
            {
              componentCls,
              prefixCls,
              iconCls: `.${iconPrefixCls}`,
              antCls: `.${rootPrefixCls}`,
              calc,
              max,
              min,
            },
            defaultComponentToken,
          );
          const styleInterpolation = styleFn(mergedToken, {
            hashId: hashId.value,
            prefixCls,
            rootPrefixCls,
            iconPrefixCls,
          });
          flush(component, componentToken);
          const commonStyle =
            typeof getCommonStyle === 'function' ? getCommonStyle(mergedToken, prefixCls, rootCls, options.resetFont) : null;
          return [options.resetStyle === false ? null : commonStyle, styleInterpolation];
        },
      );
      return hashId.value;
    };
  }

  function genSubStyleComponent<C extends TokenMapKey<CompTokenMap>>(
    componentName: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options: {
      resetStyle?: boolean;
      resetFont?: boolean;
      // Deprecated token key map [["oldTokenKey", "newTokenKey"], ["oldTokenKey", "newTokenKey"]]
      deprecatedTokens?: [ComponentTokenKey<CompTokenMap, AliasToken, C>, ComponentTokenKey<CompTokenMap, AliasToken, C>][];
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      /**
       * Set order of component style. Default is -999.
       */
      order?: number;
      injectStyle?: boolean;
      unitless?: Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;
    } = {},
  ) {
    const useStyle = genComponentStyleHook(componentName, styleFn, getDefaultToken, {
      resetStyle: false,

      // Sub Style should default after root one
      order: -998,
      ...options,
    });

    const StyledComponent = ({ prefixCls, rootCls = prefixCls }: SubStyleComponentProps) => {
      useStyle(prefixCls, rootCls);
      return null;
    };

    if (process.env.NODE_ENV !== 'production') {
      StyledComponent.displayName = `SubStyle_${String(Array.isArray(componentName) ? componentName.join('.') : componentName)}`;
    }

    return StyledComponent;
  }

  return { genStyleHooks, genSubStyleComponent, genComponentStyleHook };
}

export default genStyleUtils;
