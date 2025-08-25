<script lang="tsx" setup>
import { falseToUndefined } from '@/vc-util/props';
import clsx from 'clsx';
import { computed, getCurrentInstance, shallowRef, type CSSProperties, type InputHTMLAttributes } from 'vue';

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: Event;
}

export interface CheckboxProps extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'onChange' | 'checked'> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  disabled?: boolean;
  title?: string;
  type?: InputHTMLAttributes['type'];
  onChange?: (e: CheckboxChangeEvent) => void;
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckboxRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  input: () => HTMLInputElement | null;
  nativeElement: () => HTMLElement | null;
}

defineOptions({ inheritAttrs: false });

const {
  prefixCls = 'rc-checkbox',
  class: className,
  style,
  disabled,
  type = 'checkbox',
  title,
  onChange,
  ...inputProps
} = defineProps<CheckboxProps>();
const vm = getCurrentInstance();

const inputRef = shallowRef<HTMLInputElement>(null);
const holderRef = shallowRef<HTMLElement>(null);

const value = defineModel<boolean>('checked');
defineExpose({
  focus: (options) => {
    inputRef.value?.focus(options);
  },
  blur: () => {
    inputRef.value?.blur();
  },
  input: () => inputRef.value,
  nativeElement: () => holderRef.value,
});

const classString = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-checked`]: value.value,
    [`${prefixCls}-disabled`]: disabled,
  });
});

const handleChange = (e: Event) => {
  if (disabled) {
    return;
  }
  value.value = (e.target as HTMLInputElement).checked;
  onChange?.({
    target: {
      ...vm.props,
      ...vm.attrs,
      type,
      checked: (e.target as HTMLInputElement).checked,
    },
    stopPropagation() {
      e.stopPropagation();
    },
    preventDefault() {
      e.preventDefault();
    },
    nativeEvent: e,
  });
};
</script>
<template>
  <span :class="classString" :title="title" :style="style" ref="holderRef">
    <input
      v-bind="{ ...inputProps, ...falseToUndefined($attrs) }"
      :class="`${prefixCls}-input`"
      ref="inputRef"
      @change="handleChange"
      :disabled="disabled"
      :checked="!!value"
      :type="type"
    />
    <span :class="`${prefixCls}-inner`"></span>
  </span>
</template>
