import { updateCSS } from '@/vc-util/Dom/dynamicCSS';
import hash from '@emotion/hash';
import { ATTR_MARK, ATTR_TOKEN, CSS_IN_JS_INSTANCE, useStyleContext } from '../StyleContext';
import type Theme from '../theme/Theme';
import { flattenToken, memoResult, token2key, toStyleStr } from '../util';
import { transformToken } from '../util/css-variables';
import type { ExtractStyle } from './useGlobalCache';
import useGlobalCache from './useGlobalCache';

const EMPTY_OVERRIDE = {};

const hashPrefix = process.env.NODE_ENV !== 'production' ? 'css-dev-only-do-not-override' : 'css';

export interface Option<DerivativeToken, DesignToken> {
  salt?: string;
  override?: object;
  formatToken?: (mergedToken: any) => DerivativeToken;
  getComputedToken?: (origin: DesignToken, override: object, theme: Theme<any, any>) => DerivativeToken;
  cssVar: {
    hashed?: boolean;
    prefix?: string;
    unitless?: Record<string, boolean>;
    ignore?: Record<string, boolean>;
    preserve?: Record<string, boolean>;
    key: string;
  };
}

const tokenKeys = new Map<string, number>();

function recordCleanToken(tokenKey: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) + 1);
}

function removeStyleTags(key: string, instanceId: string) {
  if (typeof document !== 'undefined') {
    const styles = document.querySelectorAll(`style[${ATTR_TOKEN}="${key}"]`);

    styles.forEach((style) => {
      if ((style as any)[CSS_IN_JS_INSTANCE] === instanceId) {
        style.parentNode?.removeChild(style);
      }
    });
  }
}

const TOKEN_THRESHOLD = -1;

function cleanTokenStyle(tokenKey: string, instanceId: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const cleanableKeyList = new Set<string>();
  tokenKeys.forEach((value, key) => {
    if (value <= 0) cleanableKeyList.add(key);
  });

  if (tokenKeys.size - cleanableKeyList.size > TOKEN_THRESHOLD) {
    cleanableKeyList.forEach((key) => {
      removeStyleTags(key, instanceId);
      tokenKeys.delete(key);
    });
  }
}

export const getComputedToken = <DerivativeToken = object, DesignToken = DerivativeToken>(
  originToken: DesignToken,
  overrideToken: object,
  theme: Theme<any, any>,
  format?: (token: DesignToken) => DerivativeToken,
) => {
  const derivativeToken = theme.getDerivativeToken(originToken);

  let mergedDerivativeToken = {
    ...derivativeToken,
    ...overrideToken,
  };

  if (format) {
    mergedDerivativeToken = format(mergedDerivativeToken);
  }

  return mergedDerivativeToken;
};

export const TOKEN_PREFIX = 'token';

type TokenCacheValue<DerivativeToken> = [
  token: DerivativeToken,
  hashId: string,
  realToken: DerivativeToken,
  cssVarStr: string,
  cssVarKey: string,
];

/**
 * Cache theme derivative token as global shared one
 */
export default function useCacheToken<DerivativeToken = object, DesignToken = DerivativeToken>(
  theme: Theme<any, any>,
  tokens: Partial<DesignToken>[],
  option: Option<DerivativeToken, DesignToken>,
): TokenCacheValue<DerivativeToken> {
  const styleContext = useStyleContext();
  const {
    cache: { instanceId },
    container,
    hashPriority,
  } = styleContext.value;

  const { salt = '', override = EMPTY_OVERRIDE, formatToken, getComputedToken: compute, cssVar } = option;

  const mergedToken = memoResult(() => Object.assign({}, ...tokens), tokens);

  const tokenStr = flattenToken(mergedToken);
  const overrideTokenStr = flattenToken(override);
  const cssVarStr = flattenToken(cssVar);

  const cachedToken = useGlobalCache<TokenCacheValue<DerivativeToken>>(
    TOKEN_PREFIX,
    [salt, theme.id, tokenStr, overrideTokenStr, cssVarStr],
    () => {
      const mergedDerivativeToken = compute
        ? compute(mergedToken, override, theme)
        : getComputedToken(mergedToken, override, theme, formatToken);
      const actualToken = { ...mergedDerivativeToken };

      const mergedSalt = `${salt}_${cssVar.prefix}`;
      const hashId = hash(mergedSalt);
      const hashCls = `${hashPrefix}-${hashId}`;
      (actualToken as any)._tokenKey = token2key(actualToken, mergedSalt);

      const [tokenWithCssVar, cssVarsStr] = transformToken(mergedDerivativeToken, cssVar.key, {
        prefix: cssVar.prefix,
        ignore: cssVar.ignore,
        unitless: cssVar.unitless,
        preserve: cssVar.preserve,
        hashPriority,
        hashCls: cssVar.hashed ? hashCls : undefined,
      }) as [any, string];
      tokenWithCssVar._hashId = hashId;

      recordCleanToken(cssVar.key);
      return [tokenWithCssVar, hashCls, actualToken, cssVarsStr, cssVar.key];
    },
    ([, , , , themeKey]) => {
      cleanTokenStyle(themeKey, instanceId);
    },
    ([, , , cssVarsStr, themeKey]) => {
      if (!cssVarsStr) {
        return;
      }
      const style = updateCSS(cssVarsStr, hash(`css-var-${themeKey}`), {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: container,
        priority: -999,
      });

      (style as any)[CSS_IN_JS_INSTANCE] = instanceId;
      style?.setAttribute(ATTR_TOKEN, themeKey);
    },
  );

  return cachedToken;
}

export const extract: ExtractStyle<TokenCacheValue<any>> = (cache, _effectStyles, options) => {
  const [, , realToken, styleStr, cssVarKey] = cache;
  const { plain } = options || {};

  if (!styleStr) {
    return null;
  }

  const styleId = realToken._tokenKey;
  const order = -999;

  const sharedAttrs = {
    'data-rc-order': 'prependQueue',
    'data-rc-priority': `${order}`,
  };

  const styleText = toStyleStr(styleStr, cssVarKey, styleId, sharedAttrs, plain);

  return [order, styleId, styleText];
};
