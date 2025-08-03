<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, nextTick, onMounted, ref, toRefs, watch, type CSSProperties } from 'vue';
import type { TextAreaProps } from '.';
import { falseToUndefined } from '../../vc-util/props';
import raf from '../../vc-util/raf';
import ResizeObserver from '../resize-observer';
import calculateAutoSizeStyle from './calculateNodeHeight';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  autoSize,
  onResize,
  class: className,
  style,
  disabled,
  onChange,
  // Test only
  ...restProps
} = defineProps<TextAreaProps>();

const RESIZE_START = 0;
const RESIZE_MEASURING = 1;
const RESIZE_STABLE = 2;

// =============================== Value ================================
const value = defineModel<string>('value');

function onInternalChange(e: Event) {
  value.value = (e.target as HTMLTextAreaElement).value;
  onChange?.(e);
}

// ================================ Ref =================================
const textareaRef = ref<HTMLTextAreaElement>();

// ============================== AutoSize ==============================
const { minRows, maxRows } = toRefs(
  reactiveComputed((): { minRows?: number; maxRows?: number } => {
    if (autoSize && typeof autoSize === 'object') {
      return { minRows: autoSize.minRows, maxRows: autoSize.maxRows };
    }

    return {};
  }),
);

const needAutoSize = computed(() => !!autoSize);

// =============================== Scroll ===============================
// https://github.com/ant-design/ant-design/issues/21870
function fixFirefoxAutoScroll() {
  try {
    // FF has bug with jump of scroll to top. We force back here.
    if (document.activeElement === textareaRef.value) {
      const { selectionStart, selectionEnd, scrollTop } = textareaRef.value;

      // Fix Safari bug which not rollback when break line
      // This makes Chinese IME can't input. Do not fix this
      // const { value: tmpValue } = textareaRef;
      // textareaRef.value = '';
      // textareaRef.value = tmpValue;

      textareaRef.value.setSelectionRange(selectionStart, selectionEnd);
      textareaRef.value.scrollTop = scrollTop;
    }
  } catch {
    // Fix error in Chrome:
    // Failed to read the 'selectionStart' property from 'HTMLInputElement'
    // http://stackoverflow.com/q/21177489/3040605
  }
}

// =============================== Resize ===============================
const resizeState = ref(RESIZE_STABLE);
const autoSizeStyle = ref<CSSProperties>();

const startResize = () => {
  resizeState.value = RESIZE_START;
};

// Change to trigger resize measure
watch(
  [() => value.value, () => minRows?.value, () => maxRows?.value, () => needAutoSize.value],
  () => {
    if (needAutoSize.value) {
      // 等待 DOM 更新完成后执行（更像 useLayoutEffect）
      nextTick(() => {
        startResize();
      });
    }
  },
  { immediate: true },
);

watch(
  () => resizeState.value,
  async (val) => {
    await nextTick();
    if (val === RESIZE_START) {
      resizeState.value = RESIZE_MEASURING;
    } else if (resizeState.value === RESIZE_MEASURING) {
      const textareaStyles = calculateAutoSizeStyle(textareaRef.value, false, minRows?.value, maxRows?.value);
      resizeState.value = RESIZE_STABLE;
      autoSizeStyle.value = textareaStyles;
    } else {
      fixFirefoxAutoScroll();
    }
  },
  { immediate: true, deep: true },
);

// We lock resize trigger by raf to avoid Safari warning
const resizeRafRef = ref<number>();
function cleanRaf() {
  raf.cancel(resizeRafRef.value);
}

function onInternalResize(entries) {
  const { width, height } = entries;
  const size = { width, height };
  if (resizeState.value === RESIZE_STABLE) {
    onResize?.(size);
    if (autoSize) {
      cleanRaf();
      resizeRafRef.value = raf(() => {
        startResize();
      });
    }
  }
}

onMounted(() => {
  cleanRaf();
});

// =============================== Render ===============================

const mergedStyle = computed(() => {
  const mergedAutoSizeStyle = needAutoSize.value ? autoSizeStyle.value : null;

  const result: CSSProperties = {
    ...(style as CSSProperties),
    ...mergedAutoSizeStyle,
  };

  if (resizeState.value === RESIZE_START || resizeState.value === RESIZE_MEASURING) {
    result.overflowY = 'hidden';
    result.overflowX = 'hidden';
  }
  return result;
});

defineExpose({
  textArea: () => textareaRef.value,
});
</script>
<template>
  <ResizeObserver @resize="onInternalResize" :disabled="!(autoSize || onResize)">
    <textarea
      ref="textareaRef"
      v-bind="{ ...restProps, ...falseToUndefined($attrs) }"
      :style="mergedStyle"
      :class="
        clsx(prefixCls, className, {
          [`${prefixCls}-disabeld`]: disabled,
        })
      "
      :disabled="disabled"
      :value="value"
      @input="onInternalChange"
    ></textarea>
  </ResizeObserver>
</template>
