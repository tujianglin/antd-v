<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { useTemplateRef, type CSSProperties, type InputHTMLAttributes } from 'vue';
import { BaseInput } from '../input';
import type { BaseInputProps } from '../input/interface';
import { triggerFocus, type InputFocusOptions } from '../input/utils/commonUtils';
import type { ValueType } from '../mini-decimal';
import InternalInputNumber from './InternalInputNumber.vue';
import { SemanticContextProvider } from './SemanticContext';

export type { ValueType };

export interface InputNumberRef extends HTMLInputElement {
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  nativeElement: HTMLElement;
}

type SemanticName = 'actions' | 'input';
export interface InputNumberProps<T extends ValueType = ValueType>
  extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'onInput' | 'onChange' | 'prefix' | 'suffix' | 'disabled' | 'readonly'> {
  /** value will show as string */
  stringMode?: boolean;

  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  min?: T;
  max?: T;
  step?: ValueType;
  tabindex?: number;
  disabled?: boolean;
  readonly?: boolean;
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
  parser?: (displayValue: string | undefined) => T;
  /** Transform `value` to display value show in input */
  formatter?: (value: T | undefined, info: { userTyping: boolean; input: string }) => string;
  /** Syntactic sugar of `formatter`. Config precision of display. */
  precision?: number;
  /** Syntactic sugar of `formatter`. Config decimal separator of display. */
  decimalSeparator?: string;

  onInput?: (text: string) => void;
  onChange?: (value: T | null) => void;
  onPressenter?: (e: KeyboardEvent) => void;

  onStep?: (value: T, info: { offset: ValueType; type: 'up' | 'down'; emitter: 'handler' | 'keyboard' | 'wheel' }) => void;

  /**
   * Trigger change onBlur event.
   * If disabled, user must press enter or click handler to confirm the value update
   */
  changeOnBlur?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  disabled,
  style,
  prefixCls = 'rc-input-number',
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  class: className,
  classNames,
  styles,
  controls = true,
  keyboard = true,
  onChange,
  ...rest
} = defineProps<InputNumberProps>();

const value = defineModel<ValueType>('value');

const holderRef = useTemplateRef('holderRef');
const inputFocusRef = useTemplateRef('internalInputNumberRef');

const focus = (option?: InputFocusOptions) => {
  if (inputFocusRef.value?.input) {
    triggerFocus(inputFocusRef.value?.input, option);
  }
};

defineExpose({
  focus,
  blur: () => inputFocusRef.value?.input?.blur?.(),
  get nativeElement() {
    return holderRef.value.nativeElement || inputFocusRef.value?.el;
  },
});

function handleChange(e) {
  value.value = e;
  onChange?.(e);
}
</script>
<template>
  <SemanticContextProvider :value="{ classNames, styles }">
    <BaseInput
      :class="className"
      :trigger-focus="focus"
      :prefix-cls="prefixCls"
      v-model:value="value"
      :disabled="disabled"
      :style="style"
      :prefix="prefix"
      :suffix="suffix"
      :addon-after="addonAfter"
      :addon-before="addonBefore"
      :class-names="classNames"
      :styles="styles"
      :components="{
        affixWrapper: 'div',
        groupWrapper: 'div',
        wrapper: 'div',
        groupAddon: 'div',
      }"
      ref="holderRef"
    >
      <InternalInputNumber
        v-bind="{ ...rest, ...$attrs }"
        v-model:value="value"
        :controls="controls"
        :keyboard="keyboard"
        :prefix-cls="prefixCls"
        :disabled="disabled"
        ref="internalInputNumberRef"
        :class="classNames?.input"
        :style="styles?.input"
        @change="handleChange"
      />
    </BaseInput>
  </SemanticContextProvider>
</template>
