<script lang="tsx" setup>
import { BaseInput } from '@/vc-component/input';
import type { CommonInputProps } from '@/vc-component/input/interface';
import type { TextAreaProps } from '@/vc-component/textarea';
import clsx from 'clsx';
import { computed, useTemplateRef, type CSSProperties } from 'vue';
import InternalMentions from './InternalMentions.vue';
import type { OptionProps } from './Option';
import { validateSearch as defaultValidateSearch } from './util';

type BaseTextareaAttrs = Omit<TextAreaProps, 'prefix' | 'onChange' | 'onSelect' | 'showCount' | 'classNames'>;

export type Placement = 'top' | 'bottom';
export type Direction = 'ltr' | 'rtl';

export interface DataDrivenOptionProps extends Omit<OptionProps, 'children'> {
  label?: any;
}

export interface MentionsProps extends BaseTextareaAttrs {
  id?: string;
  autofocus?: boolean;
  class?: string;
  notFoundContent?: any;
  split?: string;
  style?: CSSProperties;
  transitionName?: string;
  placement?: Placement;
  direction?: Direction;
  prefix?: string | string[];
  prefixCls?: string;
  silent?: boolean;
  filterOption?: any;
  validateSearch?: typeof defaultValidateSearch;
  onChange?: (text: string) => void;
  onSelect?: (option: OptionProps, prefix: string) => void;
  onSearch?: (text: string, prefix: string) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  getPopupContainer?: () => HTMLElement;
  popupClassName?: string;
  options?: DataDrivenOptionProps[];
  classNames?: CommonInputProps['classNames'] & {
    mentions?: string;
    textarea?: string;
    popup?: string;
  };
  styles?: {
    textarea?: CSSProperties;
    popup?: CSSProperties;
  };
  onPopupScroll?: (event: UIEvent) => void;
}

export interface MentionsRef {
  focus: VoidFunction;
  blur: VoidFunction;

  /** @deprecated It may not work as expected */
  textarea: HTMLTextAreaElement | null;

  nativeElement: HTMLElement;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  suffix,
  prefixCls = 'rc-mentions',
  allowClear,
  onChange,
  classNames: mentionsClassNames,
  styles,
  class: className,
  disabled,
  onClear,
  ...rest
} = defineProps<MentionsProps>();

const hasSuffix = computed(() => !!(suffix || allowClear));

// =============================== Ref ================================
const holderRef = useTemplateRef('holderRef');
const mentionRef = useTemplateRef('mentionRef');

defineExpose({
  get el() {
    return mentionRef.value;
  },
  get nativeElement() {
    return holderRef.value?.nativeElement || mentionRef.value?.nativeElement;
  },
});

// ============================== Value ===============================
const mergedValue = defineModel('value', { default: '' });

// ============================== Change ==============================
const triggerChange = (currentValue: string) => {
  mergedValue.value = currentValue;
  onChange?.(currentValue);
};

// ============================== Reset ===============================
const handleReset = () => {
  triggerChange('');
};
</script>
<template>
  <BaseInput
    :suffix="suffix"
    :prefix-cls="prefixCls"
    :value="mergedValue"
    :allow-clear="allowClear"
    :handle-reset="handleReset"
    :class="
      clsx(prefixCls, className, {
        // hasSuffix
        [`${prefixCls}-has-suffix`]: hasSuffix,
      })
    "
    :class-names="mentionsClassNames"
    :disabled="disabled"
    ref="holderRef"
    @clear="onClear"
  >
    <InternalMentions
      ref="mentionRef"
      v-bind="{ ...rest, ...$attrs }"
      :class="mentionsClassNames?.mentions"
      :styles="styles"
      :class-names="mentionsClassNames"
      :prefix-cls="prefixCls"
      @change="triggerChange"
      :disabled="disabled"
      :has-wrapper="hasSuffix"
    />
  </BaseInput>
</template>
