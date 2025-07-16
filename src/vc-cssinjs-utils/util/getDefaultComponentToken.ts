import type { TokenType } from '@/vc-cssinjs';
import type { GlobalToken, TokenMap, TokenMapKey } from '../interface';
import type { GetDefaultToken, GetDefaultTokenFn } from './genStyleUtils';
import { merge as mergeToken } from './statistic';

function getDefaultComponentToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
>(
  component: C,
  token: GlobalToken<CompTokenMap, AliasToken>,
  getDefaultToken: GetDefaultToken<CompTokenMap, AliasToken, C>,
): any {
  if (typeof getDefaultToken === 'function') {
    return (getDefaultToken as GetDefaultTokenFn<CompTokenMap, AliasToken, C>)(mergeToken<any>(token, token[component] ?? {}));
  }
  return getDefaultToken ?? {};
}

export default getDefaultComponentToken;
