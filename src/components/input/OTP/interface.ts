import type { InputStatus } from '@/components/_util/statusUtils';
import type { Variant } from '@/components/config-provider/context';
import type { SizeType } from '@/components/config-provider/SizeContext';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes, InputTypeHTMLAttribute } from 'vue';

type SemanticName = 'root' | 'input' | 'separator';

export interface OTPRef {
  focus: VoidFunction;
  blur: VoidFunction;
  nativeElement: () => HTMLDivElement;
}

export interface OTPProps extends /* @vue-ignore */ Omit<HTMLAttributes, 'onChange' | 'onInput'> {
  prefixCls?: string;
  length?: number;

  // Style
  variant?: Variant;
  rootClassName?: string;
  class?: string;
  style?: CSSProperties;
  size?: SizeType;
  autofocus?: boolean;

  // Values
  onChange?: (value: string) => void;
  formatter?: (value: string) => string;
  separator?: ((index: number) => VueNode) | VueNode;

  // Status
  disabled?: boolean;
  status?: InputStatus;

  mask?: boolean | string;

  type?: InputTypeHTMLAttribute;

  onInput?: (value: string[]) => void;

  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface SeparatorProps {
  index: number;
  prefixCls: string;
  separator: OTPProps['separator'];
  class?: string;
  style?: CSSProperties;
}
