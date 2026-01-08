import { removeCSS, updateCSS } from '@/vc-util/Dom/dynamicCSS';
import hash from '@emotion/hash';
import unitless from '@emotion/unitless';
import type * as CSS from 'csstype';
import { compile, middleware, prefixer, serialize, stringify } from 'stylis';
import type { Theme, Transformer } from '..';
import type Keyframes from '../Keyframes';
import type { Linter } from '../linters';
import { contentQuotesLinter, hashedAnimationLinter } from '../linters';
import type { HashPriority } from '../StyleContext';
import { ATTR_CACHE_PATH, ATTR_MARK, CSS_IN_JS_INSTANCE, useStyleContext } from '../StyleContext';
import { isClientSide, toStyleStr, where } from '../util';
import { CSS_FILE_STYLE, existPath, getStyleAndHash } from '../util/cacheMapUtil';
import type { ExtractStyle } from './useGlobalCache';
import useGlobalCache from './useGlobalCache';

const SKIP_CHECK = '_skip_check_';
const MULTI_VALUE = '_multi_value_';

export interface LayerConfig {
  name: string;
  dependencies?: string[];
}

export type CSSProperties = Omit<CSS.PropertiesFallback<number | string>, 'animationName'> & {
  animationName?: CSS.PropertiesFallback<number | string>['animationName'] | Keyframes;
};

export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | readonly Extract<CSSProperties[K], string>[]
    | {
        [SKIP_CHECK]?: boolean;
        [MULTI_VALUE]?: boolean;
        value: CSSProperties[K] | CSSProperties[K][];
      };
};

export type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject };

type ArrayCSSInterpolation = readonly CSSInterpolation[];

export type InterpolationPrimitive = null | undefined | boolean | number | string | CSSObject;

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation | Keyframes;

export type CSSOthersObject = Record<string, CSSInterpolation>;

export interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos, CSSOthersObject {}

// ============================================================================
// ==                                 Parser                                 ==
// ============================================================================
export function normalizeStyle(styleStr: string, autoPrefix: boolean) {
  const serialized = autoPrefix
    ? serialize(compile(styleStr), middleware([prefixer, stringify]))
    : serialize(compile(styleStr), stringify);

  return serialized.replace(/\{%%%:[^;];}/g, ';');
}

function isCompoundCSSProperty(value: CSSObject[string]) {
  return typeof value === 'object' && value && (SKIP_CHECK in value || MULTI_VALUE in value);
}

function injectSelectorHash(key: string, hashId: string, hashPriority: HashPriority = 'high') {
  if (!hashId) {
    return key;
  }

  const hashSelector = where({ hashCls: hashId, hashPriority });

  const keys = key.split(',').map((k) => {
    const fullPath = k.trim().split(/\s+/);
    let firstPath = fullPath[0] || '';
    const htmlElement = firstPath.match(/^\w+/)?.[0] || '';

    firstPath = `${htmlElement}${hashSelector}${firstPath.slice(htmlElement.length)}`;

    return [firstPath, ...fullPath.slice(1)].join(' ');
  });
  return keys.join(',');
}

export interface ParseConfig {
  hashId?: string;
  hashPriority?: HashPriority;
  layer?: LayerConfig;
  path?: string;
  transformers?: Transformer[];
  linters?: Linter[];
}

export interface ParseInfo {
  root?: boolean;
  injectHash?: boolean;
  parentSelectors: string[];
}

export const parseStyle = (
  interpolation: CSSInterpolation,
  config: ParseConfig = {},
  { root, injectHash, parentSelectors }: ParseInfo = {
    root: true,
    parentSelectors: [],
  },
): [parsedStr: string, effectStyle: Record<string, string>] => {
  const { hashId, layer, path, hashPriority, transformers = [], linters = [] } = config;
  let styleStr = '';
  let effectStyle: Record<string, string> = {};

  function parseKeyframes(keyframes: Keyframes) {
    const animationName = keyframes.getName(hashId);
    if (!effectStyle[animationName]) {
      const [parsedStr] = parseStyle(keyframes.style, config, {
        root: false,
        parentSelectors,
      });

      effectStyle[animationName] = `@keyframes ${keyframes.getName(hashId)}${parsedStr}`;
    }
  }

  function flattenList(list: ArrayCSSInterpolation, fullList: CSSObject[] = []) {
    list.forEach((item) => {
      if (Array.isArray(item)) {
        flattenList(item, fullList);
      } else if (item) {
        fullList.push(item as CSSObject);
      }
    });

    return fullList;
  }

  const flattenStyleList = flattenList(Array.isArray(interpolation) ? interpolation : [interpolation]);

  flattenStyleList.forEach((originStyle) => {
    const style: CSSObject = typeof originStyle === 'string' && !root ? {} : originStyle;

    if (typeof style === 'string') {
      styleStr += `${style}\n`;
    } else if ((style as any)._keyframe) {
      parseKeyframes(style as unknown as Keyframes);
    } else {
      const mergedStyle = transformers.reduce((prev, trans) => trans?.visit?.(prev) || prev, style);

      Object.keys(mergedStyle).forEach((key) => {
        const value = mergedStyle[key];

        if (
          typeof value === 'object' &&
          value &&
          (key !== 'animationName' || !(value as Keyframes)._keyframe) &&
          !isCompoundCSSProperty(value)
        ) {
          let subInjectHash = false;
          let mergedKey = key.trim();
          let nextRoot = false;

          if ((root || injectHash) && hashId) {
            if (mergedKey.startsWith('@')) {
              subInjectHash = true;
            } else if (mergedKey === '&') {
              mergedKey = injectSelectorHash('', hashId, hashPriority);
            } else {
              mergedKey = injectSelectorHash(key, hashId, hashPriority);
            }
          } else if (root && !hashId && (mergedKey === '&' || mergedKey === '')) {
            mergedKey = '';
            nextRoot = true;
          }

          const [parsedStr, childEffectStyle] = parseStyle(value as any, config, {
            root: nextRoot,
            injectHash: subInjectHash,
            parentSelectors: [...parentSelectors, mergedKey],
          });

          effectStyle = {
            ...effectStyle,
            ...childEffectStyle,
          };

          styleStr += `${mergedKey}${parsedStr}`;
        } else {
          function appendStyle(cssKey: string, cssValue: any) {
            if (process.env.NODE_ENV !== 'production' && (typeof value !== 'object' || !(value as any)?.[SKIP_CHECK])) {
              [contentQuotesLinter, hashedAnimationLinter, ...linters].forEach((linter) =>
                linter(cssKey, cssValue, { path, hashId, parentSelectors }),
              );
            }

            const styleName = cssKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

            let formatValue = cssValue;
            if (!unitless[cssKey] && typeof formatValue === 'number' && formatValue !== 0) {
              formatValue = `${formatValue}px`;
            }

            if (cssKey === 'animationName' && (cssValue as Keyframes)?._keyframe) {
              parseKeyframes(cssValue as Keyframes);
              formatValue = (cssValue as Keyframes).getName(hashId);
            }

            styleStr += `${styleName}:${formatValue};`;
          }

          const actualValue = (value as any)?.value ?? value;
          if (typeof value === 'object' && (value as any)?.[MULTI_VALUE] && Array.isArray(actualValue)) {
            actualValue.forEach((item) => {
              appendStyle(key, item);
            });
          } else {
            appendStyle(key, actualValue);
          }
        }
      });
    }
  });

  if (!root) {
    styleStr = `{${styleStr}}`;
  } else if (layer) {
    if (styleStr) {
      styleStr = `@layer ${layer.name} {${styleStr}}`;
    }

    if (layer.dependencies) {
      effectStyle[`@layer ${layer.name}`] = layer.dependencies.map((deps) => `@layer ${deps}, ${layer.name};`).join('\n');
    }
  }

  return [styleStr, effectStyle];
};

// ============================================================================
// ==                                Register                                ==
// ============================================================================
export function uniqueHash(path: (string | number)[], styleStr: string) {
  return hash(`${path.join('%')}${styleStr}`);
}

export const STYLE_PREFIX = 'style';

type StyleCacheValue = [
  styleStr: string,
  styleId: string,
  effectStyle: Record<string, string>,
  clientOnly: boolean | undefined,
  order: number,
];

/**
 * Register a style to the global style sheet.
 */
export default function useStyleRegister(
  info: {
    theme: Theme<any, any>;
    token: any;
    path: string[];
    hashId?: string;
    layer?: LayerConfig;
    nonce?: string | (() => string);
    clientOnly?: boolean;
    order?: number;
  },
  styleFn: () => CSSInterpolation,
) {
  const { path, hashId, layer, nonce, clientOnly, order = 0 } = info;
  const styleContext = useStyleContext();
  const { mock, hashPriority, container, transformers, linters, cache, layer: enableLayer, autoPrefix } = styleContext.value;

  const fullPath: string[] = [hashId || ''];
  if (enableLayer) {
    fullPath.push('layer');
  }
  fullPath.push(...path);

  let isMergedClientSide = isClientSide;
  if (process.env.NODE_ENV !== 'production' && mock !== undefined) {
    isMergedClientSide = mock === 'client';
  }

  useGlobalCache<StyleCacheValue>(
    STYLE_PREFIX,
    fullPath,
    () => {
      const cachePath = fullPath.join('|');

      if (existPath(cachePath)) {
        const [inlineCacheStyleStr, styleHash] = getStyleAndHash(cachePath);
        if (inlineCacheStyleStr) {
          return [inlineCacheStyleStr, styleHash, {}, clientOnly, order];
        }
      }

      const styleObj = styleFn();
      const [parsedStyle, effectStyle] = parseStyle(styleObj, {
        hashId,
        hashPriority,
        layer: enableLayer ? layer : undefined,
        path: path.join('-'),
        transformers,
        linters,
      });

      const styleStr = normalizeStyle(parsedStyle, autoPrefix || false);
      const styleId = uniqueHash(fullPath, styleStr);

      return [styleStr, styleId, effectStyle, clientOnly, order];
    },
    (cacheValue, fromHMR) => {
      const [, styleId] = cacheValue;
      if (fromHMR && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK, attachTo: container });
      }
    },
    (cacheValue) => {
      const [styleStr, styleId, effectStyle, , priority] = cacheValue;
      if (isMergedClientSide && styleStr !== CSS_FILE_STYLE) {
        const mergedCSSConfig: Parameters<typeof updateCSS>[2] = {
          mark: ATTR_MARK,
          prepend: enableLayer ? false : 'queue',
          attachTo: container,
          priority,
        };

        const nonceStr = typeof nonce === 'function' ? nonce() : nonce;

        if (nonceStr) {
          mergedCSSConfig.csp = { nonce: nonceStr };
        }

        const effectLayerKeys: string[] = [];
        const effectRestKeys: string[] = [];

        Object.keys(effectStyle).forEach((key) => {
          if (key.startsWith('@layer')) {
            effectLayerKeys.push(key);
          } else {
            effectRestKeys.push(key);
          }
        });

        effectLayerKeys.forEach((effectKey) => {
          updateCSS(normalizeStyle(effectStyle[effectKey], autoPrefix || false), `_layer-${effectKey}`, {
            ...mergedCSSConfig,
            prepend: true,
          });
        });

        const style = updateCSS(styleStr, styleId, mergedCSSConfig);

        (style as any)[CSS_IN_JS_INSTANCE] = cache.instanceId;

        if (process.env.NODE_ENV !== 'production') {
          style?.setAttribute(ATTR_CACHE_PATH, fullPath.join('|'));
        }

        effectRestKeys.forEach((effectKey) => {
          updateCSS(normalizeStyle(effectStyle[effectKey], autoPrefix || false), `_effect-${effectKey}`, mergedCSSConfig);
        });
      }
    },
  );
}

export const extract: ExtractStyle<StyleCacheValue> = (cache, effectStyles, options) => {
  const [styleStr, styleId, effectStyle, clientOnly, order]: StyleCacheValue = cache;
  const { plain, autoPrefix } = options || {};

  if (clientOnly) {
    return null;
  }

  let keyStyleText = styleStr;

  const sharedAttrs = {
    'data-rc-order': 'prependQueue',
    'data-rc-priority': `${order}`,
  };

  keyStyleText = toStyleStr(styleStr, undefined, styleId, sharedAttrs, plain);

  if (effectStyle) {
    Object.keys(effectStyle).forEach((effectKey) => {
      if (!effectStyles[effectKey]) {
        effectStyles[effectKey] = true;
        const effectStyleStr = normalizeStyle(effectStyle[effectKey], autoPrefix || false);
        const effectStyleHTML = toStyleStr(effectStyleStr, undefined, `_effect-${effectKey}`, sharedAttrs, plain);

        if (effectKey.startsWith('@layer')) {
          keyStyleText = effectStyleHTML + keyStyleText;
        } else {
          keyStyleText += effectStyleHTML;
        }
      }
    });
  }

  return [order, styleId, keyStyleText];
};
