import type { InputProps as VcInputProps } from '../../vc-component/input';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks/useMergeSemantic';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/SizeContext';

type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'count';

export type InputClassNamesType = SemanticClassNamesType<InputProps, SemanticName>;
export type InputStylesType = SemanticStylesType<InputProps, SemanticName>;

export interface InputProps
  extends Omit<
    VcInputProps,
    'wrapperClassName' | 'groupClassName' | 'inputClassName' | 'affixWrapperClassName' | 'classes' | 'classNames' | 'styles'
  > {
  rootClassName?: string;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  variant?: Variant;
  classNames?: InputClassNamesType;
  styles?: InputStylesType;
  [key: `data-${string}`]: string | undefined;
}
