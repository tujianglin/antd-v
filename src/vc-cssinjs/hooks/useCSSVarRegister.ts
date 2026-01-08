import { removeCSS, updateCSS } from '@/vc-util/Dom/dynamicCSS';
import hash from '@emotion/hash';
import { ATTR_MARK, ATTR_TOKEN, CSS_IN_JS_INSTANCE, useStyleContext } from '../StyleContext';
import { isClientSide, toStyleStr } from '../util';
import type { TokenWithCSSVar } from '../util/css-variables';
import { transformToken } from '../util/css-variables';
import type { ExtractStyle } from './useGlobalCache';
import useGlobalCache from './useGlobalCache';

export const CSS_VAR_PREFIX = 'cssVar';

type CSSVarCacheValue<V, T extends Record<string, V> = Record<string, V>> = [
  cssVarToken: TokenWithCSSVar<V, T>,
  cssVarStr: string,
  styleId: string,
  cssVarKey: string,
];

const useCSSVarRegister = <V, T extends Record<string, V>>(
  config: {
    path: string[];
    key: string;
    prefix?: string;
    unitless?: Record<string, boolean>;
    ignore?: Record<string, boolean>;
    scope?: string;
    token: any;
    hashId?: string;
  },
  fn: () => T,
) => {
  const { key, prefix, unitless, ignore, token, hashId, scope = '' } = config;
  const styleContext = useStyleContext();
  const {
    cache: { instanceId },
    container,
    hashPriority,
  } = styleContext.value;
  const { _tokenKey: tokenKey } = token;

  // stylePath 包含 tokenKey，用于缓存 key，主题变化时触发缓存更新
  const stylePath = [...config.path, key, scope, tokenKey];

  // styleId 不包含 tokenKey，主题变化时保持不变，实现样式替换而非新建
  // 与 useCacheToken 中 hash(`css-var-${themeKey}`) 的策略一致
  const stableStyleId = hash(`${CSS_VAR_PREFIX}-${config.path.join('-')}-${key}${scope ? `-${scope}` : ''}`);

  const cache = useGlobalCache<CSSVarCacheValue<V, T>>(
    CSS_VAR_PREFIX,
    stylePath,
    () => {
      const originToken = fn();
      const [mergedToken, cssVarsStr] = transformToken<V, T>(originToken, key, {
        prefix,
        unitless,
        ignore,
        scope,
        hashPriority,
        hashCls: hashId,
      });
      return [mergedToken, cssVarsStr, stableStyleId, key];
    },
    ([, , styleId]) => {
      if (isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK, attachTo: container });
      }
    },
    ([, cssVarsStr, styleId]) => {
      if (!cssVarsStr) {
        return;
      }
      const style = updateCSS(cssVarsStr, styleId, {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: container,
        priority: -999,
      });

      (style as any)[CSS_IN_JS_INSTANCE] = instanceId;
      style?.setAttribute(ATTR_TOKEN, key);
    },
  );

  return cache;
};

export const extract: ExtractStyle<CSSVarCacheValue<any>> = (cache, _effectStyles, options) => {
  const [, styleStr, styleId, cssVarKey] = cache;
  const { plain } = options || {};

  if (!styleStr) {
    return null;
  }

  const order = -999;

  const sharedAttrs = {
    'data-rc-order': 'prependQueue',
    'data-rc-priority': `${order}`,
  };

  const styleText = toStyleStr(styleStr, cssVarKey, styleId, sharedAttrs, plain);

  return [order, styleId, styleText];
};

export default useCSSVarRegister;
