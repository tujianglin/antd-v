<script lang="tsx" setup>
import { computed, nextTick, ref, type CSSProperties } from 'vue';
import type { OnStartMove } from '../interface';
import { getIndex } from '../util';
import type { HandleProps } from './Handle.vue';
import Handle from './Handle.vue';

export interface HandlesProps {
  prefixCls: string;
  style?: CSSProperties;
  values: number[];
  onStartMove: OnStartMove;
  onOffsetChange: (value: number | 'min' | 'max', valueIndex: number) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onDelete?: (index: number) => void;
  handleRender?: HandleProps['render'];
  /**
   * When config `activeHandleRender`,
   * it will render another hidden handle for active usage.
   * This is useful for accessibility or tooltip usage.
   */
  activeHandleRender?: HandleProps['render'];
  draggingIndex: number;
  draggingDelete: boolean;
  onChangeComplete?: () => void;
}

export interface HandlesRef {
  focus: (index: number) => void;
  hideHelp: VoidFunction;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  style,
  onStartMove,
  onOffsetChange,
  values,
  handleRender,
  activeHandleRender,
  draggingIndex,
  draggingDelete,
  onFocus,
  ...restProps
} = defineProps<HandlesProps>();

const handlesRef = ref<Record<number, any>>({});

// =========================== Active ===========================
const activeVisible = ref(false);
const activeIndex = ref(-1);

const onActive = (index: number) => {
  activeIndex.value = index;
  activeVisible.value = true;
};

const onHandleFocus = (e: FocusEvent, index: number) => {
  onActive(index);
  onFocus?.(e);
};

const onHandleMouseEnter = (_e: MouseEvent, index: number) => {
  onActive(index);
};

// =========================== Render ===========================
defineExpose({
  focus: (index: number) => {
    handlesRef.value[index]?.el?.focus();
  },
  hideHelp: () => {
    nextTick(() => {
      activeVisible.value = false;
    });
  },
});

// =========================== Render ===========================
// Handle Props
const handleProps = computed(() => {
  return {
    prefixCls,
    onStartMove,
    onOffsetChange,
    render: handleRender,
    onFocus: onHandleFocus,
    onMouseenter: onHandleMouseEnter,
    ...restProps,
  };
});
</script>
<template>
  <Handle
    v-for="(value, index) in values"
    :key="index"
    :ref="
      (node) => {
        if (!node) {
          delete handlesRef[index];
        } else {
          handlesRef[index] = node as HTMLDivElement;
        }
      }
    "
    :dragging="draggingIndex === index"
    :dragging-delete="draggingIndex === index && draggingDelete"
    :style="getIndex(style, index)"
    :value="value"
    :value-index="index"
    v-bind="handleProps"
  />

  <Handle
    v-if="activeHandleRender && activeVisible"
    key="a11y"
    v-bind="handleProps"
    :value="values[activeIndex]"
    :value-index="null"
    :dragging="draggingIndex !== -1"
    :dragging-delete="draggingDelete"
    :render="activeHandleRender"
    :style="{ pointerEvents: 'none' }"
    :tabindex="null"
    aria-hidden
  />
</template>
