import type { CSSProperties } from 'vue';
import type { RenderNode } from '../_util/type';

export interface AbstractCheckboxProps<T> {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  checked?: boolean;
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
  tabIndex?: number;
  name?: string;
  id?: string;
  autofocus?: boolean;
  type?: string;
  skipGroup?: boolean;
  required?: boolean;
}
type SemanticName = 'root' | 'icon' | 'label';

export interface CheckboxProps extends AbstractCheckboxProps<CheckboxChangeEvent> {
  indeterminate?: boolean;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
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
  label: RenderNode;
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
