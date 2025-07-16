import { updateCSS } from '@/vc-util/Dom/dynamicCSS';
import hash from '@emotion/hash';
import { reactiveComputed } from '@vueuse/core';
import { computed, type ComputedRef, type Reactive } from 'vue';
import { ATTR_MARK, ATTR_TOKEN, CSS_IN_JS_INSTANCE, useStyleInject } from '../StyleContext';
import type Theme from '../theme/Theme';
import { flattenToken, memoResult, token2key, toStyleStr } from '../util';
import { transformToken } from '../util/css-variables';
import type { ExtractStyle } from './useGlobalCache';
import useGlobalCache from './useGlobalCache';
const EMPTY_OVERRIDE = {};
// Generate different prefix to make user selector break in production env.
// This helps developer not to do style override directly on the hash id.
const hashPrefix = process.env.NODE_ENV !== 'production' ? 'css-dev-only-do-not-override' : 'css';

export interface Option<DerivativeToken, DesignToken> {
  /**
   * Generate token with salt.
   * This is used to generate different hashId even same derivative token for different version.
   */
  salt?: string;
  override?: object;
  /**
   * Format token as you need. Such as:
   *
   * - rename token
   * - merge token
   * - delete token
   *
   * This should always be the same since it's one time process.
   * It's ok to useMemo outside but this has better cache strategy.
   */
  formatToken?: (mergedToken: any) => DerivativeToken;
  /**
   * Get final token with origin token, override token and theme.
   * The parameters do not contain formatToken since it's passed by user.
   * @param origin The original token.
   * @param override Extra tokens to override.
   * @param theme Theme instance. Could get derivative token by `theme.getDerivativeToken`
   */
  getComputedToken?: (origin: DesignToken, override: object, theme: Theme<any, any>) => DerivativeToken;

  /**
   * Transform token to css variables.
   */
  cssVar: {
    hashed?: boolean;
    /** Prefix for css variables */
    prefix?: string;
    /** Tokens that should not be appended with unit */
    unitless?: Record<string, boolean>;
    /** Tokens that should not be transformed to css variables */
    ignore?: Record<string, boolean>;
    /** Tokens that preserves origin value */
    preserve?: Record<string, boolean>;
    /** Key for current theme. Useful for customizing and should be unique */
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

// Remove will check current keys first
function cleanTokenStyle(tokenKey: string, instanceId: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const tokenKeyList = Array.from(tokenKeys.keys());
  const cleanableKeyList = tokenKeyList.filter((key) => {
    const count = tokenKeys.get(key) || 0;

    return count <= 0;
  });

  // Should keep tokens under threshold for not to insert style too often
  if (tokenKeyList.length - cleanableKeyList.length > TOKEN_THRESHOLD) {
    cleanableKeyList.forEach((key) => {
      removeStyleTags(key, instanceId);
      tokenKeys.delete(key);
    });
  }
}

export const getComputedToken = <DerivativeToken, DesignToken = DerivativeToken>(
  originToken: DesignToken,
  overrideToken: object,
  theme: Theme<any, any>,
  format?: (token: DesignToken) => DerivativeToken,
) => {
  const derivativeToken = theme.getDerivativeToken(originToken);

  // Merge with override
  let mergedDerivativeToken = {
    ...derivativeToken,
    ...overrideToken,
  };

  // Format if needed
  if (format) {
    mergedDerivativeToken = format(mergedDerivativeToken);
  }

  return mergedDerivativeToken;
};

export const TOKEN_PREFIX = 'token';

type TokenCacheValue<DerivativeToken> = {
  token: DerivativeToken;
  hashId: string;
  realToken: DerivativeToken;
  cssVarStr: string;
  cssVarKey: string;
};

/**
 * Cache theme derivative token as global shared one
 * @param theme Theme entity
 * @param tokens List of tokens, used for cache. Please do not dynamic generate object directly
 * @param option Additional config
 * @returns Call Theme.getDerivativeToken(tokenObject) to get token
 */
export default function useCacheToken<DerivativeToken, DesignToken = DerivativeToken>(
  theme: ComputedRef<Theme<any, any>>,
  tokens: ComputedRef<Partial<DesignToken>[]>,
  option: ComputedRef<Option<DerivativeToken, DesignToken>>,
): Reactive<TokenCacheValue<DerivativeToken>> {
  const styleContext = useStyleInject();

  // Basic - We do basic cache here
  const mergedToken = computed(() => {
    return memoResult(() => Object.assign({}, ...tokens.value), tokens.value);
  });

  const tokenStr = computed(() => flattenToken(mergedToken.value));
  const overrideTokenStr = computed(() => flattenToken(option.value.override || EMPTY_OVERRIDE));

  const cssVarStr = computed(() => flattenToken(option.value.cssVar));

  const cachedToken = useGlobalCache<TokenCacheValue<DerivativeToken>>(
    TOKEN_PREFIX,
    computed(() => {
      return [option.value.salt || '', theme.value.id, tokenStr.value, overrideTokenStr.value, cssVarStr.value];
    }),
    () => {
      const { salt = '', override = EMPTY_OVERRIDE, formatToken, getComputedToken: compute, cssVar } = option.value;
      const mergedDerivativeToken = compute
        ? compute(mergedToken.value, override, theme.value)
        : getComputedToken(mergedToken.value, override, theme.value, formatToken);
      const actualToken = { ...mergedDerivativeToken };

      // Optimize for `useStyleRegister` performance
      const mergedSalt = `${salt}_${cssVar.prefix}`;
      // @ts-ignore 1111
      const hashId = hash(mergedSalt);
      // @ts-ignore 1111
      const hashCls = `${hashPrefix}-${hash(mergedSalt)}`;
      actualToken._tokenKey = token2key(actualToken, mergedSalt);

      // Replace token value with css variables
      const [tokenWithCssVar, cssVarsStr] = transformToken(mergedDerivativeToken, cssVar.key, {
        prefix: cssVar.prefix,
        ignore: cssVar.ignore,
        unitless: cssVar.unitless,
        preserve: cssVar.preserve,
        hashPriority: styleContext.value.hashPriority,
        hashCls: cssVar.hashed ? hashCls : undefined,
      }) as [any, string];
      tokenWithCssVar._hashId = hashId;

      recordCleanToken(cssVar.key);
      return {
        token: tokenWithCssVar,
        hashId: hashCls,
        realToken: actualToken,
        cssVarStr: cssVarsStr,
        cssVarKey: cssVar.key,
      };
    },
    ({ cssVarKey }) => {
      // Remove token will remove all related style
      cleanTokenStyle(cssVarKey, styleContext.value.cache.instanceId);
    },
    ({ cssVarStr, cssVarKey }) => {
      if (!cssVarStr) {
        return;
      }
      // @ts-ignore 1111
      const style = updateCSS(cssVarStr, hash(`css-var-${cssVarKey}`), {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: styleContext.value.container,
        priority: -999,
      });
      (style as any)[CSS_IN_JS_INSTANCE] = styleContext.value.cache.instanceId;
      style.setAttribute(ATTR_TOKEN, cssVarKey);
    },
  );
  return reactiveComputed(() => cachedToken.value);
}

export const extract: ExtractStyle<TokenCacheValue<any>> = (cache, _effectStyles, options) => {
  const { realToken, cssVarStr, cssVarKey } = cache;
  const { plain } = options || {};

  if (!cssVarStr) {
    return null;
  }

  const styleId = realToken._tokenKey;
  const order = -999;

  // ====================== Style ======================
  // Used for vc-util
  const sharedAttrs = {
    'data-vc-order': 'prependQueue',
    'data-vc-priority': `${order}`,
  };

  const styleText = toStyleStr(cssVarStr, cssVarKey, styleId, sharedAttrs, plain);

  return [order, styleId, styleText];
};
