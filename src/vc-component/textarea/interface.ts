import type { CSSProperties, TextareaHTMLAttributes } from 'vue';
import type { BaseInputProps, CommonInputProps, InputProps } from '../input/interface';

export interface AutoSizeType {
  minRows?: number;
  maxRows?: number;
}

// To compatible with origin usage. We have to wrap this
export interface ResizableTextAreaRef {
  textArea: HTMLTextAreaElement;
}

export type TextAreaProps = {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  autoSize?: boolean | AutoSizeType;
  onPressEnter?: (e: KeyboardEvent) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onChange?: (e) => void;
  classNames?: CommonInputProps['classNames'] & {
    textarea?: string;
    count?: string;
  };
  styles?: {
    textarea?: CSSProperties;
    count?: CSSProperties;
  };
} & Pick<BaseInputProps, 'allowClear' | 'suffix' | 'maxlength'> &
  Pick<InputProps, 'showCount' | 'count' | 'onClear'> &
  /* @vue-ignore */ Omit<TextareaHTMLAttributes, 'onResize' | 'value' | 'style' | 'onChange' | 'class' | 'hidden' | 'maxlength'>;

export type TextAreaRef = {
  focus: () => void;
  blur: () => void;
  resizableTextArea: ResizableTextAreaRef;
  nativeElement: HTMLElement;
};
