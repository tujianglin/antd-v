<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, effect, ref, useAttrs, watch } from 'vue';
import useCount from './hooks/useCount';
import type { BaseInputProps, InputProps } from './interface';
import { resolveOnChange, triggerFocus, type InputFocusOptions } from './utils/commonUtils';
import { omit } from 'lodash-es';
import { cn } from '@/utils/cn';
import { Render } from '@/components';
import BaseInput from './BaseInput.vue';

const props = withDefaults(defineProps<InputProps>(), { prefixCls: 'rc-input', type: 'text' });

const attrs = useAttrs();

const bindProps = reactiveComputed(() => ({ ...props, ...attrs }) as InputProps);

const value = defineModel<string>('value');

const focused = ref(false);
const keyLockRef = ref(false);

const inputRef = ref<HTMLInputElement>(null);

const focus = (option?: InputFocusOptions) => {
  if (inputRef.value) {
    triggerFocus(inputRef.value, option);
  }
};

// =================== Select Range ===================
const selection = ref<[start: number, end: number] | null>(null);

// ====================== Count =======================
const countConfig = useCount(
  computed(() => bindProps.count),
  computed(() => bindProps.showCount),
);
const mergedMax = computed(() => countConfig.max || (bindProps.maxlength as number));
const valueLength = computed(() => countConfig.strategy(value.value));

const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value);

watch(
  () => bindProps.disabled,
  (val) => {
    if (keyLockRef.value) {
      keyLockRef.value = false;
    }
    focused.value = focused.value && val ? false : focused.value;
  },
  { immediate: true },
);

watch(
  () => selection.value,
  (val) => {
    if (val) {
      inputRef.value?.setSelectionRange(...val);
    }
  },
  { immediate: true, deep: true },
);

effect(() => {
  // console.log(cloneDeep(bindProps));
});

function handleKeyDown(e: KeyboardEvent) {
  if (bindProps.onPressEnter && e.key === 'Enter' && !keyLockRef.value && !e.isComposing) {
    keyLockRef.value = true;
    bindProps.onPressEnter?.(e);
  }
  bindProps.onKeydown?.(e);
}
function handleKeyUp(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    keyLockRef.value = false;
  }
  bindProps.onKeyup?.(e);
}

function handleChange(e: MouseEvent) {
  bindProps.onChange?.(e);
}

function handleFocus(e: FocusEvent) {
  focused.value = true;
  bindProps.onFocus?.(e);
}

function handleBlur(e: FocusEvent) {
  if (keyLockRef.value) {
    keyLockRef.value = false;
  }
  focused.value = false;
  bindProps.onBlur?.(e);
}

function handleReset(e: MouseEvent) {
  value.value = '';
  focus();
  if (inputRef.value) {
    resolveOnChange(inputRef.value, e, bindProps.onChange);
  }
}

const InputElement = () => {
  const otherProps: any = omit(bindProps, [
    'class',
    'style',
    'prefixCls',
    'onPressEnter',
    'addonBefore',
    'addonAfter',
    'prefix',
    'suffix',
    'allowClear',
    // Input elements must be either controlled or uncontrolled,
    // specify either the value prop, or the defaultValue prop, but not both.
    'defaultValue',
    'showCount',
    'count',
    'htmlSize',
    'styles',
    'classNames',
    'onInput',
    'onChange',
    'onClear',
    'onBlur',
    'onFocus',
    'onKeydown',
    'onKeyup',
    'variant',
    'modelValue',
  ]);
  return (
    <input
      autoComplete={bindProps.autoComplete}
      {...otherProps}
      v-model={value.value}
      class={cn(
        bindProps.prefixCls,
        {
          [`${bindProps.prefixCls}-disabled`]: bindProps.disabled,
        },
        bindProps.classNames?.input,
      )}
      style={bindProps.styles?.input}
      ref={inputRef}
      size={bindProps.htmlSize}
      type={bindProps.type}
      onKeydown={handleKeyDown}
      onKeyup={handleKeyUp}
      onInput={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

const suffix = computed(() => {
  // Max length value
  const hasMaxLength = Number(mergedMax) > 0;
  if (bindProps.suffix || countConfig.show) {
    const dataCount = countConfig.showFormatter
      ? countConfig.showFormatter({
          value: value.value,
          count: valueLength.value,
          maxlength: mergedMax.value,
        })
      : `${valueLength.value}${hasMaxLength ? ` / ${mergedMax.value}` : ''}`;
    return (
      <>
        {countConfig.show && (
          <span
            class={cn(
              `${bindProps.prefixCls}-show-count-suffix`,
              {
                [`${bindProps.prefixCls}-show-count-has-suffix`]: !!bindProps.suffix,
              },
              bindProps.classNames?.count,
            )}
            style={{
              ...bindProps.styles?.count,
            }}
          >
            {dataCount}
          </span>
        )}
        <Render content={bindProps.suffix}></Render>
      </>
    );
  }
  return undefined;
});

const delegatedProps = computed(() => {
  return omit(bindProps, [
    'autoComplete',
    'onChange',
    'onFocus',
    'onBlur',
    'onPressEnter',
    'onKeydown',
    'onKeyup',
    'prefixCls',
    'disabled',
    'htmlSize',
    'class',
    'maxlength',
    'suffix',
    'showCount',
    'count',
    'type',
    'classNames',
    'styles',
  ]) as BaseInputProps;
});

const outOfRangeCls = computed(() => isOutOfRange.value && `${bindProps.prefixCls}-out-of-range`);

defineExpose({
  focus,
  blur: () => {
    inputRef.value?.blur();
  },
  setSelectionRange: (start: number, end: number, direction?: 'forward' | 'backward' | 'none') => {
    inputRef.value?.setSelectionRange(start, end, direction);
  },
  select: () => {
    inputRef.value?.select();
  },
  input: inputRef.value,
});
</script>
<template>
  <BaseInput
    v-bind="delegatedProps"
    :prefix-cls="bindProps.prefixCls"
    :class="cn(bindProps.class, outOfRangeCls)"
    v-model:value="value"
    :focused="focused"
    :trigger-focus="focus"
    :suffix="suffix"
    :disabled="bindProps.disabled"
    :class-names="bindProps.classNames"
    :styles="bindProps.styles"
    :handle-reset="handleReset"
  >
    <InputElement />
  </BaseInput>
</template>
