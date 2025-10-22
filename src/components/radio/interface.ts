import type { CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import type { AbstractCheckboxGroupProps, AbstractCheckboxProps } from '../checkbox/interface';
import type { SizeType } from '../config-provider/SizeContext';

export type RadioGroupButtonStyle = 'outline' | 'solid';
export type RadioGroupOptionType = 'default' | 'button';

export interface RadioGroupProps extends AbstractCheckboxGroupProps {
  onChange?: (e: RadioChangeEvent) => void;
  size?: SizeType;
  disabled?: boolean;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  name?: string;
  id?: string;
  optionType?: RadioGroupOptionType;
  orientation?: Orientation;
  buttonStyle?: RadioGroupButtonStyle;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  block?: boolean;
  vertical?: boolean;
}

export interface RadioGroupContextProps {
  onChange: (e: RadioChangeEvent) => void;
  disabled?: boolean;
  name?: string;
  value?: any;
  /**
   * Control the appearance for Radio to display as button or not
   *
   * @default 'default'
   * @internal
   */
  optionType?: RadioGroupOptionType;
  block?: boolean;
}

type SemanticName = 'root' | 'icon' | 'label';
export interface RadioProps extends AbstractCheckboxProps<RadioChangeEvent> {
  /**
   * Control the appearance for Radio to display as button or not
   *
   * @default 'default'
   * @internal
   */
  optionType?: RadioGroupOptionType;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface RadioChangeEventTarget extends RadioProps {
  checked: boolean;
}

export interface RadioChangeEvent {
  target: RadioChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

export type RadioOptionTypeContextProps = RadioGroupOptionType;
