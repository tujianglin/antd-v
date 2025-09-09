import { genStyleUtils } from '@/vc-cssinjs-utils';
import type { GetCompUnitless } from '@/vc-cssinjs-utils/util/genStyleUtils';
import { unref } from 'vue';
import { defaultIconPrefixCls, useConfigContextInject } from '../../config-provider/context';
import { genCommonStyle, genIconStyle, genLinkStyle } from '../../style';
import type { AliasToken, ComponentTokenMap, SeedToken } from '../interface';
import useLocalToken, { unitless } from '../useToken';

export const { genStyleHooks, genComponentStyleHook, genSubStyleComponent } = genStyleUtils<
  ComponentTokenMap,
  AliasToken,
  SeedToken
>({
  usePrefix: () => {
    const context = useConfigContextInject();

    const rootPrefixCls = context.getPrefixCls();

    return {
      rootPrefixCls,
      iconPrefixCls: unref(context.iconPrefixCls),
    };
  },
  useToken: () => {
    const [theme, realToken, hashId, token, cssVar, zeroRuntime] = useLocalToken();
    return { theme, realToken, hashId, token, cssVar, zeroRuntime };
  },
  useCSP: () => {
    const context = useConfigContextInject();
    return context.csp ?? {};
  },
  getResetStyles: (token, config) => {
    const linkStyle = genLinkStyle(token);
    return [linkStyle, { '&': linkStyle }, genIconStyle(config?.prefix.iconPrefixCls ?? defaultIconPrefixCls)];
  },
  getCommonStyle: genCommonStyle,
  getCompUnitless: (() => unitless) as GetCompUnitless<ComponentTokenMap, AliasToken>,
});

export const genCssVar = (antCls: string, componentAbbr: string) => {
  const cssPrefix = `--${antCls.replace('.', '')}-${componentAbbr}-`;

  return (name: string, withVar = false) => {
    const raw = `${cssPrefix}${name}`;
    return withVar ? `var(${raw})` : raw;
  };
};
