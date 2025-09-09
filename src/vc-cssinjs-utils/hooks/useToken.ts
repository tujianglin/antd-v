import type { Theme, TokenType } from '@/vc-cssinjs';

import type { Ref } from 'vue';
import type { GlobalToken, OverrideTokenMap, TokenMap } from '../interface';

export type TokenMapWithTheme<CompTokenMap extends TokenMap, AliasToken extends TokenType, DesignToken extends TokenType> = {
  [key in keyof OverrideTokenMap<CompTokenMap, AliasToken>]?: OverrideTokenMap<CompTokenMap, AliasToken>[key] & {
    theme?: Theme<DesignToken, AliasToken>;
  };
};

export interface UseTokenReturn<CompTokenMap extends TokenMap, AliasToken extends TokenType, DesignToken extends TokenType> {
  token: Ref<GlobalToken<CompTokenMap, AliasToken>>;
  realToken?: Ref<GlobalToken<CompTokenMap, AliasToken>>;
  theme?: Ref<Theme<DesignToken, AliasToken>>;
  components?: Ref<TokenMapWithTheme<CompTokenMap, DesignToken, AliasToken>>;
  hashId?: Ref<string>;
  hashed?: Ref<string | boolean>;
  cssVar?: Ref<{
    prefix?: string;
    key?: string;
  }>;
  zeroRuntime?: Ref<boolean>;
}

export type UseToken<
  CompTokenMap extends TokenMap,
  DesignToken extends TokenType,
  AliasToken extends TokenType,
> = () => UseTokenReturn<CompTokenMap, DesignToken, AliasToken>;
