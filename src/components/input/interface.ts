import type { CSSProperties } from 'vue';
import type { InputProps as VcInputProps } from '../../vc-component/input';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/SizeContext';
type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'count';

export interface InputProps
  extends Omit<VcInputProps, 'wrapperClassName' | 'groupClassName' | 'inputClassName' | 'affixWrapperClassName' | 'classes'> {
  rootClassName?: string;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  variant?: Variant;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  [key: `data-${string}`]: string | undefined;
}
