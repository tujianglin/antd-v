<script lang="tsx" setup>
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import { clsx } from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, watch, type CSSProperties } from 'vue';
import { useBaseSelectContextInject } from '../hooks/useBaseProps';
import { useSelectInputContextInject } from './context';

export interface InputProps {
  id?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (e) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  placeholder?: string;
  class?: string;
  style?: CSSProperties;
  maxlength?: number;
  /** width always match content width */
  syncWidth?: boolean;
  /** autocomplete for input */
  autocomplete?: string;
}

const {
  onChange,
  onKeydown,
  onBlur,
  style,
  syncWidth,
  value,
  class: className,
  autocomplete,
  ...restProps
} = defineProps<InputProps>();

// eslint-disable-next-line vue/no-dupe-keys
const {
  prefixCls,
  mode,
  onSearch,
  onSearchSubmit,
  onInputBlur,
  autofocus,
  tokenWithEnter,
  placeholder,
  components: ctxComponents,
} = toRefs(useSelectInputContextInject());

const InputComponent = computed(() => ctxComponents?.value?.input || 'input');
// eslint-disable-next-line vue/no-dupe-keys
const { id, classNames, styles, open, activeDescendantId, role, disabled } = toRefs(useBaseSelectContextInject());

const inputCls = computed(() => clsx(`${prefixCls.value}-input`, classNames?.value?.input, className));

// Used to handle input method composition status
const compositionStatusRef = ref<boolean>(false);

// Used to handle paste content, similar to original Selector implementation
const pastedTextRef = ref<string | null>(null);

const vm = getCurrentInstance();
const inputRef = ref<HTMLInputElement>(null);
// ============================== Refs ==============================
const changeRef = (el) => {
  inputRef.value = el;
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
};

// ============================== Data ==============================
// Handle input changes
const handleChange = (event) => {
  let { value: nextVal } = event.target;

  // Handle pasted text with tokenWithEnter, similar to original Selector implementation
  if (tokenWithEnter.value && pastedTextRef.value && /[\r\n]/.test(pastedTextRef.value)) {
    // CRLF will be treated as a single space for input element
    const replacedText = pastedTextRef.value
      .replace(/[\r\n]+$/, '')
      .replace(/\r\n/g, ' ')
      .replace(/[\r\n]/g, ' ');
    nextVal = nextVal.replace(replacedText, pastedTextRef.value);
  }

  // Reset pasted text reference
  pastedTextRef.value = null;

  // Call onSearch callback
  if (onSearch.value) {
    onSearch?.value?.(nextVal, true, compositionStatusRef.value);
  }

  // Call original onChange callback
  onChange?.(event);
};

// ============================ Keyboard ============================
// Handle keyboard events
const handleKeyDown = (event) => {
  const { key } = event;
  const { value: nextVal } = event.valueTarget;

  // Handle Enter key submission - referencing Selector implementation
  if (key === 'Enter' && mode.value === 'tags' && !compositionStatusRef.value && onSearchSubmit?.value) {
    onSearchSubmit?.value(nextVal);
  }

  // Call original onKeyDown callback
  onKeydown?.(event);
};

// Handle blur events
const handleBlur = (event) => {
  // Call onInputBlur callback
  onInputBlur?.value?.();

  // Call original onBlur callback
  onBlur?.(event);
};

// Handle input method composition start
const handleCompositionStart = () => {
  compositionStatusRef.value = true;
};

// Handle input method composition end
const handleCompositionEnd = (event) => {
  compositionStatusRef.value = false;

  // Trigger search when input method composition ends, similar to original Selector
  if (mode.value !== 'combobox') {
    const { value: nextVal } = event.valueTarget;
    onSearch?.value?.(nextVal, true, false);
  }
};

// Handle paste events to track pasted content
const handlePaste = (event) => {
  const { clipboardData } = event;
  const pastedValue = clipboardData?.getData('text');
  pastedTextRef.value = pastedValue || '';
};

// ============================= Width ==============================
const widthCssVar = ref<number | undefined>(undefined);

// When syncWidth is enabled, adjust input width based on content
watch([() => syncWidth, () => value], () => {
  const input = inputRef?.value;

  if (syncWidth && input) {
    input.style.width = '0px';
    const scrollWidth = input.scrollWidth;
    widthCssVar.value = scrollWidth;

    // Reset input style
    input.style.width = '';
  }
});

// ============================= Render =============================
// Extract shared input props
const sharedInputProps = computed(() => ({
  id: id?.value,
  type: mode.value === 'combobox' ? 'text' : 'search',
  ...restProps,
  ref: changeRef,
  style: {
    ...styles?.value?.input,
    ...style,
    '--select-input-width': widthCssVar.value,
  } as CSSProperties,
  autofocus: autofocus.value,
  autocomplete: autocomplete || 'off',
  class: inputCls.value,
  disabled: disabled?.value,
  value: value || '',
  onInput: handleChange,
  onKeyDown: handleKeyDown,
  onBlur: handleBlur,
  onPaste: handlePaste,
  onCompositionStart: handleCompositionStart,
  onCompositionEnd: handleCompositionEnd,
  // Accessibility attributes
  role: role?.value || 'combobox',
  'aria-expanded': open?.value || false,
  'aria-haspopup': 'listbox' as const,
  'aria-owns': open?.value ? `${id?.value}_list` : undefined,
  'aria-autocomplete': 'list' as const,
  'aria-controls': open?.value ? `${id?.value}_list` : undefined,
  'aria-activedescendant': open?.value ? activeDescendantId?.value : undefined,
}));
// Handle different InputComponent types
const CustomComponent = () => {
  // If InputComponent is a ReactElement, use cloneElement with merged props
  const existingProps: any = InputComponent.value.props || {};

  // Start with shared props as base
  const mergedProps = {
    ...existingProps,
    ...sharedInputProps.value,
    placeholder: restProps.placeholder || placeholder.value,
  };

  // Batch update function calls
  Object.keys(existingProps).forEach((key) => {
    const existingValue = (existingProps as any)[key];

    if (typeof existingValue === 'function') {
      // Merge event handlers
      (mergedProps as any)[key] = (...args: any[]) => {
        existingValue(...args);
        (sharedInputProps.value as any)[key]?.(...args);
      };
    }
  });

  return cloneElement(InputComponent.value, mergedProps);
};
</script>
<template>
  <CustomComponent v-if="isValidElement(InputComponent)" />
  <component v-else :is="InputComponent" v-bind="sharedInputProps" />
</template>
