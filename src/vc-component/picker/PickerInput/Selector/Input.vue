<script lang="tsx" setup>
import Render from '@/vc-component/render';
import raf from '@/vc-util/raf';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { computed, nextTick, onBeforeUnmount, ref, toRefs, useTemplateRef, watch, type InputHTMLAttributes } from 'vue';
import type { PickerRef } from '../../interface';
import { leftPad } from '../../utils/miscUtil';
import { usePickerContextInject } from '../context';
import useLockEffect from '../hooks/useLockEffect';
import Icon from './Icon.vue';
import MaskFormat from './MaskFormat';
import { getMaskRange } from './util';

// Format logic
//
// First time on focus:
//  1. check if the text is valid, if not fill with format
//  2. set highlight cell to the first cell
// Cells
//  1. Selection the index cell, set inner `cacheValue` to ''
//  2. Key input filter non-number char, patch after the `cacheValue`
//    1. Replace the `cacheValue` with input align the cell length
//    2. Re-selection the mask cell
//  3. If `cacheValue` match the limit length or cell format (like 1 ~ 12 month), go to next cell

export interface InputRef extends PickerRef {
  inputElement: HTMLInputElement;
}

export interface InputProps extends /** @vue-ignore */ Omit<InputHTMLAttributes, 'onChange'> {
  format?: string;
  validateFormat: (value: string) => boolean;
  active?: boolean;
  /** Used for single picker only */
  showActiveCls?: boolean;
  suffixIcon?: any;
  value?: string;
  onChange: (value: string) => void;
  onSubmit: VoidFunction;
  /** Meaning current is from the hover cell getting the placeholder text */
  helped?: boolean;
  /**
   * Trigger when input need additional help.
   * Like open the popup for interactive.
   */
  onHelp: () => void;
  preserveInvalidOnBlur?: boolean;
  invalid?: boolean;

  clearIcon?: any;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  active,
  showActiveCls = true,
  suffixIcon,
  format,
  validateFormat,
  onChange,
  onInput: _onInput,
  helped,
  onHelp,
  onSubmit,
  onKeydown,
  preserveInvalidOnBlur = false,
  invalid,
  clearIcon,
  // Pass to input
  ...restProps
} = defineProps<InputProps>();

const { prefixCls, input, classNames, styles } = toRefs(usePickerContextInject());

const Component = computed(() => input.value || 'input');

const inputPrefixCls = computed(() => `${prefixCls.value}-input`);

// ======================== Value =========================
const focused = ref(false);
const internalInputValue = ref<string>(restProps.value);
const focusCellText = ref<string>('');
const focusCellIndex = ref<number>(null);
const forceSelectionSyncMark = ref<object>(null);

const inputValue = computed(() => internalInputValue.value || '');

// Sync value if needed
watch(
  () => restProps.value,
  () => {
    internalInputValue.value = restProps.value;
  },
  { immediate: true },
);

// ========================= Refs =========================
const holderRef = useTemplateRef('holderRef');
const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

defineExpose({
  get nativeElement() {
    return holderRef.value;
  },
  get inputElement() {
    return inputRef.value;
  },
  focus: (options) => {
    inputRef.value.focus(options);
  },
  blur: () => {
    inputRef.value.blur();
  },
});

// ======================== Format ========================
const maskFormat = computed(() => new MaskFormat(format || ''));

const { selectionStart, selectionEnd } = toRefs(
  reactiveComputed(() => {
    if (helped) {
      return { selectionStart: 0, selectionEnd: 0 };
    }

    return maskFormat?.value?.getSelection(focusCellIndex.value);
  }),
);

// ======================== Modify ========================
// When input modify content, trigger `onHelp` if is not the format
const onModify = (text: string) => {
  if (text && text !== format && text !== restProps.value) {
    onHelp();
  }
};

// ======================== Change ========================
/**
 * Triggered by paste, keyDown and focus to show format
 */
const triggerInputChange = (text: string) => {
  if (validateFormat(text)) {
    onChange(text);
  }
  internalInputValue.value = text;
  onModify(text);
};

// Directly trigger `onChange` if `format` is empty
const onInternalChange = (event) => {
  // Hack `onChange` with format to do nothing
  if (!format) {
    const text = event.target.value;

    onModify(text);
    internalInputValue.value = text;
    onChange(text);
  }
};

const onFormatPaste = (event: ClipboardEvent) => {
  // Get paste text
  const pasteText = event.clipboardData.getData('text');

  if (validateFormat(pasteText)) {
    triggerInputChange(pasteText);
  }
};

// ======================== Mouse =========================
// When `mouseDown` get focus, it's better to not to change the selection
// Since the up position maybe not is the first cell
const mouseDownRef = ref(false);

const onFormatMouseDown = () => {
  mouseDownRef.value = true;
};

const onFormatMouseUp = (event: MouseEvent) => {
  const { selectionStart: start } = event.target as HTMLInputElement;

  const closeMaskIndex = maskFormat?.value?.getMaskCellIndex(start);
  focusCellIndex.value = closeMaskIndex;

  // Force update the selection
  forceSelectionSyncMark.value = {};

  restProps?.onMouseup?.(event);

  mouseDownRef.value = false;
};

// ====================== Focus Blur ======================
const onFormatFocus = (event) => {
  focused.value = true;
  focusCellIndex.value = 0;
  focusCellText.value = '';
  restProps?.onFocus?.(event);
};

const onSharedBlur = (event) => {
  restProps?.onBlur?.(event);
};

const onFormatBlur = (event) => {
  focused.value = false;
  onSharedBlur(event);
};

// ======================== Active ========================
// Check if blur need reset input value
useLockEffect(
  computed(() => active),
  () => {
    if (!active && !preserveInvalidOnBlur) {
      internalInputValue.value = restProps.value;
    }
  },
);

// ======================= Keyboard =======================
const onSharedKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && validateFormat(inputValue.value)) {
    onSubmit();
  }

  onKeydown?.(event);
};

const onFormatKeyDown = (event: KeyboardEvent) => {
  onSharedKeyDown(event);

  const { key } = event;

  // Save the cache with cell text
  let nextCellText: string = null;

  // Fill in the input
  let nextFillText: string = null;

  const maskCellLen = selectionEnd.value - selectionStart.value;
  const cellFormat = format.slice(selectionStart.value, selectionEnd.value);

  // Cell Index
  const offsetCellIndex = (offset: number) => {
    let nextIndex = focusCellIndex.value + offset;
    nextIndex = Math.max(nextIndex, 0);
    nextIndex = Math.min(nextIndex, maskFormat?.value?.size() - 1);
    focusCellIndex.value = nextIndex;
  };

  // Range
  const offsetCellValue = (offset: number) => {
    const [rangeStart, rangeEnd, rangeDefault] = getMaskRange(cellFormat);

    const currentText = inputValue.value.slice(selectionStart.value, selectionEnd.value);
    const currentTextNum = Number(currentText);

    if (isNaN(currentTextNum)) {
      return String(rangeDefault || (offset > 0 ? rangeStart : rangeEnd));
    }

    const num = currentTextNum + offset;
    const range = rangeEnd - rangeStart + 1;
    return String(rangeStart + ((range + num - rangeStart) % range));
  };

  switch (key) {
    // =============== Remove ===============
    case 'Backspace':
    case 'Delete':
      nextCellText = '';
      nextFillText = cellFormat;
      break;

    // =============== Arrows ===============
    // Left key
    case 'ArrowLeft':
      nextCellText = '';
      offsetCellIndex(-1);
      break;

    // Right key
    case 'ArrowRight':
      nextCellText = '';
      offsetCellIndex(1);
      break;

    // Up key
    case 'ArrowUp':
      nextCellText = '';
      nextFillText = offsetCellValue(1);
      break;

    // Down key
    case 'ArrowDown':
      nextCellText = '';
      nextFillText = offsetCellValue(-1);
      break;

    // =============== Number ===============
    default:
      if (!isNaN(Number(key))) {
        nextCellText = focusCellText.value + key;
        nextFillText = nextCellText;
      }
      break;
  }

  // Update cell text
  if (nextCellText !== null) {
    focusCellText.value = nextCellText;

    if (nextCellText.length >= maskCellLen) {
      // Go to next cell
      offsetCellIndex(1);
      focusCellText.value = '';
    }
  }

  // Update the input text
  if (nextFillText !== null) {
    // Replace selection range with `nextCellText`
    const nextFocusValue =
      // before
      inputValue.value.slice(0, selectionStart.value) +
      // replace
      leftPad(nextFillText, maskCellLen) +
      // after
      inputValue.value.slice(selectionEnd.value);
    triggerInputChange(nextFocusValue.slice(0, format.length));
  }

  // Always trigger selection sync after key down
  forceSelectionSyncMark.value = {};
};

// ======================== Format ========================
const rafRef = ref<number>();

watch(
  [maskFormat, () => format, focused, inputValue, focusCellIndex, selectionStart, selectionEnd, forceSelectionSyncMark],
  async () => {
    await nextTick();
    if (!focused.value || !format || mouseDownRef.value) {
      return;
    }

    // Reset with format if not match
    if (!maskFormat.value.match(inputValue.value)) {
      triggerInputChange(format);
      return;
    }

    // Match the selection range
    inputRef.value.setSelectionRange(selectionStart.value, selectionEnd.value);

    // Chrome has the bug anchor position looks not correct but actually correct
    rafRef.value = raf(() => {
      inputRef.value.setSelectionRange(selectionStart.value, selectionEnd.value);
    });
  },
  { immediate: true, deep: true, flush: 'post' },
);

onBeforeUnmount(() => {
  raf.cancel(rafRef.value);
});

// ======================== Render ========================
// Input props for format
const inputProps = computed(() => {
  return format
    ? {
        onFocus: onFormatFocus,
        onBlur: onFormatBlur,
        onKeydown: onFormatKeyDown,
        onMousedown: onFormatMouseDown,
        onMouseup: onFormatMouseUp,
        onPaste: onFormatPaste,
      }
    : {};
});
</script>
<template>
  <div
    ref="holderRef"
    :class="
      clsx(
        inputPrefixCls,
        {
          [`${inputPrefixCls}-active`]: active && showActiveCls,
          [`${inputPrefixCls}-placeholder`]: helped,
        },
        className,
      )
    "
  >
    <component
      :is="Component"
      ref="inputRef"
      :aria-invalid="invalid"
      autocomplete="off"
      @keydown="onSharedKeyDown"
      @blur="onSharedBlur"
      v-bind="{ ...$attrs, ...omit(restProps, ['onBlur', 'onKeydown']), ...inputProps }"
      :value="inputValue"
      @input="onInternalChange"
      :class="classNames.input"
      :style="styles.input"
    />
    <Icon type="suffix" :icon="suffixIcon" />
    <Render :content="clearIcon" />
  </div>
</template>
