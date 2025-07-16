import type { Theme, TokenType } from '@/vc-cssinjs';

import type { ComputedRef } from 'vue';
import type { GlobalToken, OverrideTokenMap, TokenMap } from '../interface';

export type TokenMapWithTheme<CompTokenMap extends TokenMap, AliasToken extends TokenType, DesignToken extends TokenType> = {
  [key in keyof OverrideTokenMap<CompTokenMap, AliasToken>]?: OverrideTokenMap<CompTokenMap, AliasToken>[key] & {
    theme?: Theme<DesignToken, AliasToken>;
  };
};

export interface UseTokenReturn<CompTokenMap extends TokenMap, AliasToken extends TokenType, DesignToken extends TokenType> {
  token: ComputedRef<GlobalToken<CompTokenMap, AliasToken>>;
  realToken?: ComputedRef<GlobalToken<CompTokenMap, AliasToken>>;
  theme?: ComputedRef<Theme<DesignToken, AliasToken>>;
  components?: TokenMapWithTheme<CompTokenMap, DesignToken, AliasToken>;
  hashId?: ComputedRef<string>;
  hashed?: string | boolean;
  cssVar?: ComputedRef<{
    prefix?: string;
    key?: string;
  }>;
  zeroRuntime?: boolean;
}

export type UseToken<
  CompTokenMap extends TokenMap,
  DesignToken extends TokenType,
  AliasToken extends TokenType,
> = () => UseTokenReturn<CompTokenMap, DesignToken, AliasToken>;
