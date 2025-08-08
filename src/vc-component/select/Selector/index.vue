<script lang="tsx" setup>
import { Render } from '@/components';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import { computed, ref } from 'vue';
import useLock from '../hooks/useLock';
import { isValidateOpenKey } from '../utils/keyUtil';
import type { SelectorProps } from './interface';
import MultipleSelector from './MultipleSelector.vue';
import SingleSelector from './SingleSelector.vue';

defineOptions({ name: 'Selector', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixClassName,
  prefixStyle,
  prefixCls,
  open,
  mode,
  showSearch,
  tokenWithEnter,
  disabled,
  prefix,

  autoClearSearchValue,

  onSearch,
  onSearchSubmit,
  onToggleOpen,
  onInputKeyDown,
  onInputBlur,
} = defineProps<SelectorProps>();

const inputRef = ref<HTMLInputElement>(null);
const compositionStatusRef = ref<boolean>(false);

// ======================= Ref =======================
const containerRef = ref<HTMLDivElement>(null);

defineExpose({
  focus: (options) => {
    inputRef.value.focus(options);
  },
  blur: () => {
    inputRef.value.blur();
  },
  get nativeElement() {
    return containerRef.value;
  },
});

// ====================== Input ======================
const [getInputMouseDown, setInputMouseDown] = useLock(0);

const onInternalInputKeyDown = (event: KeyboardEvent) => {
  const { which } = event;

  // Compatible with multiple lines in TextArea
  const isTextAreaElement = inputRef.value instanceof HTMLTextAreaElement;
  if (!isTextAreaElement && open && (which === KeyCode.UP || which === KeyCode.DOWN)) {
    event.preventDefault();
  }

  if (onInputKeyDown) {
    onInputKeyDown(event);
  }

  if (which === KeyCode.ENTER && mode === 'tags' && !compositionStatusRef.value && !open) {
    // When menu isn't open, OptionList won't trigger a value change
    // So when enter is pressed, the tag's input value should be emitted here to let selector know
    onSearchSubmit?.((event.target as HTMLInputElement).value);
  }
  // Move within the text box
  if (isTextAreaElement && !open && ~[KeyCode.UP, KeyCode.DOWN, KeyCode.LEFT, KeyCode.RIGHT].indexOf(which)) {
    return;
  }
  if (isValidateOpenKey(which)) {
    onToggleOpen?.(true);
  }
};

/**
 * We can not use `findDOMNode` sine it will get warning,
 * have to use timer to check if is input element.
 */
const onInternalInputMouseDown = () => {
  setInputMouseDown?.(true);
};

// When paste come, ignore next onChange
const pastedTextRef = ref<string>(null);

const triggerOnSearch = (value: string) => {
  if (onSearch?.(value, true, compositionStatusRef.value) !== false) {
    onToggleOpen?.(true);
  }
};

const onInputCompositionStart = () => {
  compositionStatusRef.value = true;
};

const onInputCompositionEnd = (e: CompositionEvent) => {
  compositionStatusRef.value = false;

  // Trigger search again to support `tokenSeparators` with typewriting
  if (mode !== 'combobox') {
    triggerOnSearch((e.target as HTMLInputElement).value);
  }
};

const onInputChange = (event) => {
  let {
    target: { value },
  } = event;

  // Pasted text should replace back to origin content
  if (tokenWithEnter && pastedTextRef.value && /[\r\n]/.test(pastedTextRef.value)) {
    // CRLF will be treated as a single space for input element
    const replacedText = pastedTextRef.value
      .replace(/[\r\n]+$/, '')
      .replace(/\r\n/g, ' ')
      .replace(/[\r\n]/g, ' ');
    value = value.replace(replacedText, pastedTextRef.value);
  }

  pastedTextRef.value = null;

  triggerOnSearch(value);
};

const onInputPaste = (e: ClipboardEvent) => {
  const { clipboardData } = e;
  const value = clipboardData?.getData('text');
  pastedTextRef.value = value || '';
};

const onClick = ({ target }) => {
  if (target !== inputRef.value) {
    // Should focus input if click the selector
    const isIE = (document.body.style as any).msTouchAction !== undefined;
    if (isIE) {
      setTimeout(() => {
        inputRef.value.focus();
      });
    } else {
      inputRef.value.focus();
    }
  }
};

const onMouseDown = (event: MouseEvent) => {
  const inputMouseDown = getInputMouseDown();

  // when mode is combobox and it is disabled, don't prevent default behavior
  // https://github.com/ant-design/ant-design/issues/37320
  // https://github.com/ant-design/ant-design/issues/48281
  if (event.target !== inputRef.value && !inputMouseDown && !(mode === 'combobox' && disabled)) {
    event.preventDefault();
  }

  if ((mode !== 'combobox' && (!showSearch || !inputMouseDown)) || !open) {
    if (open && autoClearSearchValue !== false) {
      onSearch('', true, false);
    }
    onToggleOpen?.();
  }
};

// ================= Inner Selector ==================
const sharedProps = computed(() => ({
  onInputKeyDown: onInternalInputKeyDown,
  onInputMouseDown: onInternalInputMouseDown,
  onInputChange,
  onInputPaste,
  onInputCompositionStart,
  onInputCompositionEnd,
  onInputBlur,
}));
</script>
<template>
  <div ref="containerRef" :class="`${prefixCls}-selector`" @click="onClick" @mousedown="onMouseDown">
    <template v-if="prefix">
      <div :class="clsx(`${prefixCls}-prefix`, prefixClassName)" :style="prefixStyle">
        <Render :content="prefix" />
      </div>
    </template>
    <MultipleSelector ref="inputRef" v-if="mode === 'multiple' || mode === 'tags'" v-bind="{ ...$props, ...sharedProps }" />
    <SingleSelector ref="inputRef" v-else v-bind="{ ...$props, ...sharedProps }" />
  </div>
</template>
