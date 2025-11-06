import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';

export interface AbstractCheckboxProps<T> {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  disabled?: boolean;
  title?: string;
  onChange?: (e: T) => void;
  onClick?: (e: MouseEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onKeypress?: (e: KeyboardEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  value?: any;
  tabindex?: number;
  name?: string;
  id?: string;
  autofocus?: boolean;
  type?: string;
  skipGroup?: boolean;
  required?: boolean;
}

type SemanticName = 'root' | 'icon' | 'label';

export type CheckboxClassNamesType = SemanticClassNamesType<CheckboxProps, SemanticName>;
export type CheckboxStylesType = SemanticStylesType<CheckboxProps, SemanticName>;

export interface CheckboxProps extends AbstractCheckboxProps<CheckboxChangeEvent> {
  indeterminate?: boolean;
  classNames?: CheckboxClassNamesType;
  styles?: CheckboxStylesType;
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

export interface CheckboxOptionType<T = any> {
  label: VueNode;
  style?: CSSProperties;
  class?: string; // 👈 5.25.0+
  disabled?: boolean;
  title?: string;
  value: T;
  id?: string;
  onChange?: (e: CheckboxChangeEvent) => void;
  required?: boolean;
}

export interface AbstractCheckboxGroupProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  options?: (CheckboxOptionType | string | number)[];
  disabled?: boolean;
  style?: CSSProperties;
}
