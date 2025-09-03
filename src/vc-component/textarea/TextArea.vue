<script lang="tsx" setup>
import clsx from 'clsx';
import type { TextAreaProps } from './interface';
import { computed, ref, useTemplateRef, watch } from 'vue';
import useCount from '../input/hooks/useCount';
import { resolveOnChange } from '../input/utils/commonUtils';
import { Render } from '../../components';
import { BaseInput } from '../input';
import ResizableTextArea from './ResizableTextArea.vue';
import type { HolderRef } from '../input/BaseInput.vue';
import findDOMNode from '../../vc-util/Dom/findDOMNode';

defineOptions({ inheritAttrs: false });

const {
  onFocus,
  onBlur,
  onChange,
  allowClear,
  maxlength,
  onCompositionstart,
  onCompositionend,
  suffix,
  prefixCls = 'rc-textarea',
  showCount,
  count,
  class: className,
  style,
  disabled,
  hidden,
  classNames,
  styles,
  onResize,
  onClear,
  onPressEnter,
  readonly,
  autoSize,
  onKeydown,
  ...rest
} = defineProps<TextAreaProps>();

const value = defineModel<string>('value');

const focused = ref(false);
const compositionRef = ref(false);
const textareaResized = ref(false);

const holderRef = ref<HolderRef>(null);
const resizableTextAreaRef = useTemplateRef('resizableTextAreaRef');
const getTextArea = () => resizableTextAreaRef.value.textArea;

function focus() {
  getTextArea().focus();
}

defineExpose({
  focus,
  blur: () => {
    getTextArea().blur();
  },
  get resizableTextArea() {
    return resizableTextAreaRef.value;
  },
  get nativeElement() {
    return findDOMNode(holderRef.value.nativeElement) || getTextArea();
  },
});

watch(
  () => disabled,
  (val) => {
    focused.value = !val && focused.value;
  },
  { immediate: true },
);

// =========================== Select Range ===========================
const selection = ref<[start: number, end: number] | null>(null);

watch(
  () => selection.value,
  (val) => {
    if (val) {
      getTextArea().setSelectionRange(...val);
    }
  },
  { deep: true, immediate: true },
);

// ============================== Count ===============================
const countConfig = useCount(
  computed(() => count),
  computed(() => showCount),
);
const mergedMax = computed(() => countConfig.max ?? (maxlength as number));

// Max length value
const hasMaxLength = computed(() => Number(mergedMax.value) > 0);

const valueLength = computed(() => countConfig.strategy(value.value));

const isOutOfRange = computed(() => !!mergedMax.value && valueLength.value > mergedMax.value);

function triggerChange(e, currentValue: string) {
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
      selection.value = [getTextArea().selectionStart || 0, getTextArea().selectionEnd || 0];
    }
  }
  value.value = cutValue;

  resolveOnChange(e.currentTarget, e, onChange, cutValue);
}

// =========================== Value Update ===========================

function onInternalCompositionStart(e) {
  compositionRef.value = true;
  onCompositionstart?.(e);
}

function onInternalCompositionEnd(e) {
  compositionRef.value = false;
  triggerChange(e, e.currentTarget.value);
  onCompositionend?.(e);
}
function onInternalChange(e) {
  triggerChange(e, e.target.value);
}
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && onPressEnter && !e.isComposing) {
    onPressEnter(e);
  }
  onKeydown?.(e);
}

function handleFocus(e: FocusEvent) {
  focused.value = true;
  onFocus?.(e);
}

function handleBlur(e) {
  focused.value = false;
  onBlur?.(e);
}

// ============================== Reset ===============================
function handleReset(e: MouseEvent) {
  value.value = '';
  focus();
  resolveOnChange(getTextArea(), e, onChange);
}

const suffixNode = computed(() => {
  let suffixNode = suffix;
  let dataCount;
  if (countConfig.show) {
    if (countConfig.showFormatter) {
      dataCount = countConfig.showFormatter({
        value: value.value,
        count: valueLength.value,
        maxlength: mergedMax.value,
      });
    } else {
      dataCount = `${valueLength.value}${hasMaxLength.value ? ` / ${mergedMax.value}` : ''}`;
    }

    suffixNode = (
      <>
        <Render content={suffixNode}></Render>
        <span class={clsx(`${prefixCls}-data-count`, classNames?.count)} style={styles?.count}>
          <Render content={dataCount}></Render>
        </span>
      </>
    );
  }
  return { suffixNode, dataCount };
});

const handleResize: TextAreaProps['onResize'] = (size) => {
  onResize?.(size);
  if (getTextArea()?.style.height) {
    textareaResized.value = true;
  }
};

const isPureTextArea = computed(() => !autoSize && !showCount && !allowClear);
</script>
<template>
  <BaseInput
    v-model:value="value"
    ref="holderRef"
    :allow-clear="allowClear"
    :handle-reset="handleReset"
    :suffix="suffixNode.suffixNode"
    :prefix-cls="prefixCls"
    :class-names="{
      ...classNames,
      affixWrapper: clsx(classNames?.affixWrapper, {
        [`${prefixCls}-show-count`]: showCount,
        [`${prefixCls}-textarea-allow-clear`]: allowClear,
      }),
    }"
    :disabled="disabled"
    :focused="focused"
    :class="clsx(className, isOutOfRange && `${prefixCls}-out-of-range`)"
    :style="{
      ...style,
      ...(textareaResized && !isPureTextArea ? { height: 'auto' } : {}),
    }"
    :data-attrs="{
      affixWrapper: {
        'data-count': typeof suffixNode.dataCount === 'string' ? suffixNode.dataCount : undefined,
      },
    }"
    :hidden="hidden"
    :read-only="readonly"
    @clear="onClear"
  >
    <ResizableTextArea
      v-bind="{ ...rest, ...$attrs }"
      v-model:value="value"
      :auto-size="autoSize"
      :maxlength="maxlength"
      @keydown="handleKeyDown"
      @change="onInternalChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="onInternalCompositionStart"
      @compositionend="onInternalCompositionEnd"
      :class="clsx(classNames?.textarea)"
      :style="{ ...styles?.textarea, resize: style?.resize }"
      :disabled="disabled"
      :prefix-cls="prefixCls"
      @resize="handleResize"
      ref="resizableTextAreaRef"
      :readonly="readonly"
    />
  </BaseInput>
</template>
