import { useStyleRegister } from '@/vc-cssinjs';
import { genCalc as calc, mergeToken, statistic, statisticToken } from '@/vc-cssinjs-utils';

import type {
  AliasToken,
  FullToken,
  GenerateStyle,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  PresetColorKey,
  PresetColorType,
  SeedToken,
  UseComponentStyleResult,
} from './interface';
import { PresetColors } from './interface';
import { getLineHeight } from './themes/shared/genFontSizes';
import useToken from './useToken';
import genPresetColor from './util/genPresetColor';
import { genComponentStyleHook, genStyleHooks, genSubStyleComponent } from './util/genStyleUtils';
import useResetIconStyle from './util/useResetIconStyle';

export type { CSSUtil, TokenWithCommonCls } from '@/vc-cssinjs-utils';

export { defaultConfig, useDesignTokenContextInject, useDesignTokenContextProvider } from './context';
export {
  calc,
  // generators
  genComponentStyleHook,
  genPresetColor,
  genStyleHooks,
  genSubStyleComponent,
  getLineHeight,
  // utils
  mergeToken,
  // constant
  PresetColors,
  statistic,
  statisticToken,
  // hooks
  useResetIconStyle,
  useStyleRegister,
  useToken,
};
export type {
  AliasToken,
  FullToken,
  GenerateStyle,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  PresetColorKey,
  PresetColorType,
  SeedToken,
  UseComponentStyleResult,
};
