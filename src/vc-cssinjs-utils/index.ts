export { default as genCalc } from './util/calc';
export { default as genStyleUtils } from './util/genStyleUtils';
export { merge as mergeToken, statistic, default as statisticToken } from './util/statistic';

export type {
  ComponentToken,
  ComponentTokenKey,
  GlobalToken,
  GlobalTokenWithComponent,
  OverrideTokenMap,
  TokenMap,
  TokenMapKey,
} from './interface';
export type { default as AbstractCalculator } from './util/calc/calculator';
export type {
  CSSUtil,
  FullToken,
  GenStyleFn,
  GetDefaultToken,
  GetDefaultTokenFn,
  TokenWithCommonCls,
} from './util/genStyleUtils';
