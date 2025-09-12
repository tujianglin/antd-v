import type { VueNode } from '@/vc-util/type';
import type { CSSProperties, InputHTMLAttributes } from 'vue';
import type { BaseInputProps } from '../input/interface';
import type { InputFocusOptions } from '../input/utils/commonUtils';
import type { ValueType } from '../mini-decimal';

export type SemanticName = 'actions' | 'input';
export interface InputNumberProps
  extends /* @vue-ignore */ Omit<
    InputHTMLAttributes,
    'value' | 'defaultValue' | 'onInput' | 'onChange' | 'prefix' | 'suffix' | 'readonly'
  > {
  /** value will show as string */
  stringMode?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  min?: ValueType;
  max?: ValueType;
  step?: ValueType;
  tabindex?: number;
  controls?: boolean;
  prefix?: VueNode;
  suffix?: VueNode;
  addonBefore?: VueNode;
  addonAfter?: VueNode;
  classNames?: BaseInputProps['classNames'] & Partial<Record<SemanticName, string>>;
  styles?: BaseInputProps['styles'] & Partial<Record<SemanticName, CSSProperties>>;

  // Customize handler node
  upHandler?: VueNode;
  downHandler?: VueNode;
  keyboard?: boolean;
  changeOnWheel?: boolean;

  /** Parse display value to validate number */
  parser?: (displayValue: string | undefined) => ValueType;
  /** Transform `value` to display value show in input */
  formatter?: (value: ValueType | undefined, info: { userTyping: boolean; input: string }) => string;
  /** Syntactic sugar of `formatter`. Config precision of display. */
  precision?: number;
  /** Syntactic sugar of `formatter`. Config decimal separator of display. */
  decimalSeparator?: string;

  onInput?: (text: string) => void;
  onChange?: (value: ValueType | null) => void;
  onPressEnter?: (e: KeyboardEvent) => void;

  onStep?: (
    value: ValueType,
    info: { offset: ValueType; type: 'up' | 'down'; emitter: 'handler' | 'keyboard' | 'wheel' },
  ) => void;

  /**
   * Trigger change onBlur event.
   * If disabled, user must press enter or click handler to confirm the value update
   */
  changeOnBlur?: boolean;
}

export type InternalInputNumberProps = Omit<InputNumberProps, 'prefix' | 'suffix'>;

export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  nativeElement: HTMLElement;
}
