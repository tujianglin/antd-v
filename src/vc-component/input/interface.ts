import type { CSSProperties, HtmlHTMLAttributes, InputHTMLAttributes } from 'vue';
import type { RenderNode } from '../../components/_util/type';
import type { InputFocusOptions } from './utils/commonUtils';
import type { LiteralUnion } from './utils/types';

export type InputChangeEvnet = Event & { target?: HTMLInputElement };

export interface CommonInputProps {
  class?: string;
  style?: CSSProperties;
  disabled?: boolean;
  prefix?: RenderNode;
  suffix?: RenderNode;
  addonBefore?: RenderNode;
  addonAfter?: RenderNode;
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
  allowClear?: boolean | { clearIcon?: RenderNode };
  maxlength?: number;
  onChange?: (e: Event) => void;
}

type DataAttr = Record<`data-${string}`, string>;

export interface BaseInputProps extends CommonInputProps {
  prefixCls?: string;
  focused?: boolean;
  triggerFocus?: () => void;
  readOnly?: boolean;
  handleReset?: HtmlHTMLAttributes['onClick'];
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

export type ShowCountFormatter = (args: { value: string; count: number; maxlength?: number }) => RenderNode;

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
    /* @vue-ignore */ Omit<
      InputHTMLAttributes,
      'size' | 'prefix' | 'type' | 'class' | 'style' | 'disabled' | 'value' | 'onChange' | 'maxlength' | 'hidden'
    > {
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
  onPressEnter?: InputHTMLAttributes['onKeypress'];
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
