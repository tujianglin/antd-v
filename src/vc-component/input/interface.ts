import type { VueNode } from '@/vc-util/type';
import type { CSSProperties, InputHTMLAttributes } from 'vue';
import type { InputFocusOptions } from './utils/commonUtils';
import type { LiteralUnion } from './utils/types';

export interface CommonInputProps {
  class?: string;
  style?: CSSProperties;
  disabled?: boolean;
  prefix?: VueNode;
  suffix?: VueNode | boolean;
  addonBefore?: VueNode;
  addonAfter?: VueNode;
  classNames?: {
    affixWrapper?: string;
    prefix?: string;
    suffix?: string;
    groupWrapper?: string;
    wrapper?: string;
    variant?: string;
  };
  styles?: {
    affixWrapper?: CSSProperties;
    prefix?: CSSProperties;
    suffix?: CSSProperties;
  };
  allowClear?: boolean | { clearIcon?: VueNode };
  maxlength?: number;
}

type DataAttr = Record<`data-${string}`, string>;

export type ValueType = string | number | bigint | readonly string[] | undefined;

export interface BaseInputProps extends CommonInputProps {
  value?: ValueType;
  prefixCls?: string;
  focused?: boolean;
  triggerFocus?: () => void;
  readonly?: boolean;
  handleReset?: (e: MouseEvent) => void;
  onClear?: () => void;
  hidden?: boolean;
  dataAttrs?: {
    affixWrapper?: DataAttr;
  };
  components?: {
    affixWrapper?: 'span' | 'div';
    groupWrapper?: 'span' | 'div';
    wrapper?: 'span' | 'div';
    groupAddon?: 'span' | 'div';
  };
}

export type ShowCountFormatter = (args: { value: ValueType; count: number; maxlength?: number }) => VueNode;

export type ExceedFormatter = (value: string, config: { max: number }) => string;

export interface CountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | ShowCountFormatter;
  /** Trigger when content larger than the `max` limitation */
  exceedFormatter?: ExceedFormatter;
}

export interface InputProps
  extends CommonInputProps,
    /** @vue-ignore */ Omit<
      InputHTMLAttributes,
      'class' | 'maxlength' | 'style' | 'disabled' | 'size' | 'prefix' | 'type' | 'value'
    > {
  hidden?: boolean;
  readonly?: boolean;
  prefixCls?: string;
  // ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#%3Cinput%3E_types
  type?: LiteralUnion<
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week',
    string
  >;
  onPressenter?: (e: KeyboardEvent) => void;
  /** It's better to use `count.show` instead */
  showCount?:
    | boolean
    | {
        formatter: ShowCountFormatter;
      };
  autocomplete?: string;
  htmlSize?: number;
  classNames?: CommonInputProps['classNames'] & {
    input?: string;
    count?: string;
  };
  styles?: CommonInputProps['styles'] & {
    input?: CSSProperties;
    count?: CSSProperties;
  };
  count?: CountConfig;
  onClear?: () => void;
}

export interface InputRef {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  setSelectionRange: (start: number, end: number, direction?: 'forward' | 'backward' | 'none') => void;
  select: () => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLElement | null;
}

export interface ChangeEventInfo {
  source: 'compositionEnd' | 'change';
}
