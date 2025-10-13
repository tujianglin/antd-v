<script lang="tsx" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import type { ChangeEventInfo, InputProps, ValueType } from './interface';
import { resolveOnChange, triggerFocus, type InputFocusOptions } from './utils/commonUtils';
import useCount from './hooks/useCount';
import BaseInput from './BaseInput.vue';
import { Render } from '../../components';
import clsx from 'clsx';
import { omit } from 'lodash-es';

defineOptions({ inheritAttrs: false });

const {
  autocomplete,
  onChange,
  onFocus,
  onBlur,
  onPressenter,
  onKeydown,
  onKeyup,
  prefixCls = 'rc-input',
  disabled,
  htmlSize,
  class: className,
  maxlength,
  suffix,
  showCount,
  count,
  type = 'text',
  classNames,
  styles,
  onCompositionstart,
  onCompositionend,
  ...rest
} = defineProps<InputProps>();

const focused = ref(false);
const compositionRef = ref(false);
const keyLockRef = ref(false);

const inputRef = useTemplateRef('inputRef');
const holderRef = useTemplateRef('holderRef');

function focus(option?: InputFocusOptions) {
  if (inputRef.value) {
    triggerFocus(inputRef.value, option);
  }
}

// ====================== Value =======================
const value = defineModel<ValueType>('value');

const formatValue = computed(() => (value.value === undefined || value.value === null ? '' : String(value.value)));

// =================== Select Range ===================
const selection = ref<[start: number, end: number] | null>(null);

// ====================== Count =======================
const countConfig = useCount(
  computed(() => count),
  computed(() => showCount),
);

const mergedMax = computed(() => countConfig.max || maxlength);
const valueLength = computed(() => countConfig.strategy(formatValue.value));

const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value);

// ======================= Ref ========================
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
  get input() {
    return inputRef.value;
  },
  get nativeElement() {
    return holderRef.value?.nativeElement || inputRef.value;
  },
});

watch(
  () => disabled,
  (val) => {
    if (keyLockRef.value) {
      keyLockRef.value = false;
    }
    focused.value = focused.value && val ? false : focused.value;
  },
  { immediate: true },
);

function triggerChange(e, currentValue: string, info: ChangeEventInfo) {
  let cutValue = currentValue;

  if (
    !compositionRef.value &&
    countConfig.exceedFormatter &&
    countConfig.max &&
    countConfig.strategy(currentValue) > countConfig.max
  ) {
    cutValue = countConfig.exceedFormatter(currentValue, {
      max: countConfig.max,
    });

    if (currentValue !== cutValue) {
      selection.value = [inputRef.value?.selectionStart || 0, inputRef.value?.selectionEnd || 0];
    }
  } else if (info.source === 'compositionEnd') {
    // Avoid triggering twice
    // https://github.com/ant-design/ant-design/issues/46587
    return;
  }
  value.value = cutValue;
  if (inputRef.value) {
    resolveOnChange(inputRef.value, e, onChange, cutValue);
  }
}

watch(
  () => selection.value,
  (val) => {
    if (selection.value) {
      inputRef.value.setSelectionRange(...val);
    }
  },
  { immediate: true, deep: true },
);

function onInternalChange(e) {
  triggerChange(e, e.target.value, {
    source: 'change',
  });
}

function onInternalCompositionEnd(e) {
  compositionRef.value = false;
  triggerChange(e, e.currentTarget.value, {
    source: 'compositionEnd',
  });
  onCompositionend?.(e);
}

function handleKeyDown(e) {
  if (onPressenter && e.key === 'Enter' && !keyLockRef.value && !e.nativeEvent.isComposing) {
    keyLockRef.value = true;
    onPressenter?.(e);
  }
  onKeydown?.(e);
}
function handleKeyUp(e) {
  if (e.key === 'Enter') {
    keyLockRef.value = false;
  }
  onKeyup?.(e);
}

function handleFocus(e) {
  focused.value = true;
  onFocus?.(e);
}

function handleBlur(e) {
  if (keyLockRef.value) {
    keyLockRef.value = false;
  }
  focused.value = false;
  onBlur?.(e);
}

function handleReset(e) {
  value.value = '';
  focus();
  if (inputRef.value) {
    resolveOnChange(inputRef.value, e, onChange);
  }
}

// ====================== Input =======================
const outOfRangeCls = computed(() => isOutOfRange.value && `${prefixCls}-out-of-range`);

const getSuffix = () => {
  // Max length value
  const hasMaxLength = Number(mergedMax.value) > 0;

  if (suffix || countConfig.show) {
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
            class={clsx(
              `${prefixCls}-show-count-suffix`,
              {
                [`${prefixCls}-show-count-has-suffix`]: !!suffix,
              },
              classNames?.count,
            )}
            style={{
              ...styles?.count,
            }}
          >
            <Render content={dataCount}></Render>
          </span>
        )}
        <Render content={suffix}></Render>
      </>
    );
  }
  return null;
};
</script>
<template>
  <BaseInput
    v-bind="rest"
    :prefix-cls="prefixCls"
    :class="clsx(className, outOfRangeCls)"
    :handle-reset="handleReset"
    v-model:value="value"
    :focused="focused"
    :trigger-focus="focus"
    :suffix="getSuffix()"
    :disabled="disabled"
    :class-names="classNames"
    :styles="styles"
    ref="holderRef"
  >
    <input
      v-bind="{
        ...omit($props, [
          'style',
          'value',
          'prefixCls',
          'onPressenter',
          'addonBefore',
          'addonAfter',
          'prefix',
          'suffix',
          'allowClear',
          'showCount',
          'count',
          'htmlSize',
          'styles',
          'classNames',
          'onClear',
        ]),
        ...$attrs,
      }"
      :autocomplete="autocomplete"
      v-model="value"
      @input="onInternalChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      :class="
        clsx(
          prefixCls,
          {
            [`${prefixCls}-disabled`]: disabled,
          },
          classNames?.input,
        )
      "
      :style="styles?.input"
      ref="inputRef"
      :size="htmlSize"
      :type="type"
      @compositionstart="
        (e) => {
          compositionRef = true;
          onCompositionstart?.(e);
        }
      "
      @compositionend="onInternalCompositionEnd"
    />
  </BaseInput>
</template>
