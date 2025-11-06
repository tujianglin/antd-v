import type { VueNode } from '@/vc-util/type';
import type { InputNumberProps as VcInputNumberProps } from '../../vc-component/input-number';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/SizeContext';

type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'actions';

export type InputNumberClassNamesType = SemanticClassNamesType<InputNumberProps, SemanticName>;
export type InputNumberStylesType = SemanticStylesType<InputNumberProps, SemanticName>;
export interface InputNumberProps extends Omit<VcInputNumberProps, 'prefix' | 'size' | 'controls' | 'classNames' | 'styles'> {
  prefixCls?: string;
  rootClassName?: string;
  classNames?: InputNumberClassNamesType;
  styles?: InputNumberStylesType;
  addonBefore?: VueNode;
  addonAfter?: VueNode;
  prefix?: VueNode;
  suffix?: VueNode;
  readonly?: boolean;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: VueNode; downIcon?: VueNode };
  variant?: Variant;
}
