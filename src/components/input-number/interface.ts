import type { CSSProperties } from 'vue';
import type { InputNumberProps as VcInputNumberProps } from '../../vc-component/input-number';
import type { InputStatus } from '../_util/statusUtils';
import type { RenderNode } from '../_util/type';
import type { Variant } from '../config-provider/context';
import type { SizeType } from '../config-provider/SizeContext';

type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'actions';

export interface InputNumberProps extends Omit<VcInputNumberProps, 'prefix' | 'size' | 'controls' | 'classNames' | 'styles'> {
  prefixCls?: string;
  rootClassName?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  addonBefore?: RenderNode;
  addonAfter?: RenderNode;
  prefix?: RenderNode;
  suffix?: RenderNode;
  readonly?: boolean;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: RenderNode; downIcon?: RenderNode };
  variant?: Variant;
}
