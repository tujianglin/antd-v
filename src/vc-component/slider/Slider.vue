<script lang="tsx" setup>
import { isVueElement } from '@/vc-util/Children/util';
import isEqual from '@/vc-util/isEqual';
import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, onMounted, ref, toRefs, watch, type CSSProperties, type VNode } from 'vue';
import { SliderContextProvider, type SliderContextProps } from './context';
import type { HandlesProps, HandlesRef } from './Handles/index.vue';
import Handles from './Handles/index.vue';
import useDrag from './hooks/useDrag';
import useOffset from './hooks/useOffset';
import useRange from './hooks/useRange';
import type { AriaValueFormat, Direction, OnStartMove, SliderClassNames, SliderStyles } from './interface';
import type { InternalMarkObj } from './Marks/index.vue';
import Marks from './Marks/index.vue';
import Steps from './Steps/index.vue';
import Tracks from './Tracks/index.vue';
/**
 * New:
 * - click mark to update range value
 * - handleRender
 * - Fix handle with count not correct
 * - Fix pushable not work in some case
 * - No more FindDOMNode
 * - Move all position related style into inline style
 * - Key: up is plus, down is minus
 * - fix Key with step = null not align with marks
 * - Change range should not trigger onChange
 * - keyboard support pushable
 */

export type RangeConfig = {
  editable?: boolean;
  draggableTrack?: boolean;
  /** Set min count when `editable` */
  minCount?: number;
  /** Set max count when `editable` */
  maxCount?: number;
};

export interface SliderProps<ValueType = number | number[]> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;

  classNames?: SliderClassNames;
  styles?: SliderStyles;

  id?: string;

  // Status
  disabled?: boolean;
  keyboard?: boolean;
  autofocus?: boolean;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;

  // Value
  range?: boolean | RangeConfig;
  /** @deprecated Use `range.minCount` or `range.maxCount` to handle this */
  count?: number;
  min?: number;
  max?: number;
  step?: number | null;
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: ValueType) => void;
  onChangeComplete?: (value: ValueType) => void;

  // Cross
  allowCross?: boolean;
  pushable?: boolean | number;

  // Direction
  reverse?: boolean;
  vertical?: boolean;

  // Style
  included?: boolean;
  startPoint?: number;
  railStyle?: CSSProperties;
  dotStyle?: CSSProperties | ((dotValue: number) => CSSProperties);
  activeDotStyle?: CSSProperties | ((dotValue: number) => CSSProperties);

  // Decorations
  marks?: Record<string | number, any>;
  dots?: boolean;

  // Components
  handleRender?: HandlesProps['handleRender'];
  activeHandleRender?: HandlesProps['handleRender'];
  track?: boolean;

  // Accessibility
  tabindex?: number | number[];
  ariaLabelForHandle?: string | string[];
  ariaLabelledByForHandle?: string | string[];
  ariaRequired?: boolean;
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[];
}

export interface SliderRef {
  focus: () => void;
  blur: () => void;
}

defineOptions({ name: 'Slider', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-slider',
  class: className,
  style,
  classNames,
  styles,

  id,

  // Status
  disabled = false,
  keyboard = true,
  autofocus,
  onFocus,
  onBlur,

  // Value
  count,
  min = 0,
  max = 100,
  step = 1,
  range,
  onChange,
  onChangeComplete,

  // Cross
  allowCross = true,
  pushable = false,

  // Direction
  reverse,
  vertical,

  // Style
  included = true,
  startPoint,
  railStyle,
  dotStyle,
  activeDotStyle,

  // Decorations
  marks,
  dots,

  // Components
  handleRender,
  activeHandleRender,
  track,

  // Accessibility
  tabindex = 0,
  ariaLabelForHandle,
  ariaLabelledByForHandle,
  ariaRequired,
  ariaValueTextFormatterForHandle,
} = defineProps<SliderProps>();

const handlesRef = ref<HandlesRef>(null);
const containerRef = ref<HTMLDivElement>(null);

const direction = computed<Direction>(() => {
  if (vertical) {
    return reverse ? 'ttb' : 'btt';
  }
  return reverse ? 'rtl' : 'ltr';
});

// ============================ Range =============================
const { rangeEnabled, rangeEditable, rangeDraggableTrack, minCount, maxCount } = toRefs(useRange(computed(() => range)));

const mergedMin = computed(() => (isFinite(min) ? min : 0));
const mergedMax = computed(() => (isFinite(max) ? max : 100));

// ============================= Step =============================
const mergedStep = computed(() => (step !== null && step <= 0 ? 1 : step));

// ============================= Push =============================
const mergedPush = computed(() => {
  if (typeof pushable === 'boolean') {
    return pushable ? mergedStep.value : false;
  }
  return pushable >= 0 ? pushable : false;
});

// ============================ Marks =============================
const markList = computed((): InternalMarkObj[] => {
  return Object.keys(marks || {})
    .map<InternalMarkObj>((key) => {
      const mark = marks[key];
      const markObj: InternalMarkObj = {
        value: Number(key),
      };

      if (mark && typeof mark === 'object' && !isVueElement(mark) && ('label' in mark || 'style' in mark)) {
        markObj.style = mark.style;
        markObj.label = mark.label;
      } else {
        markObj.label = mark as VNode;
      }

      return markObj;
    })
    .filter(({ label }) => label || typeof label === 'number')
    .sort((a, b) => a.value - b.value);
});

// ============================ Format ============================
const [formatValue, offsetValues] = useOffset(
  mergedMin,
  mergedMax,
  mergedStep,
  markList,
  computed(() => allowCross),
  mergedPush,
);

// ============================ Values ============================
const mergedValue = defineModel<number | number[]>('value');

const rawValues = computed(() => {
  const valueList =
    mergedValue.value === null || mergedValue.value === undefined
      ? []
      : Array.isArray(mergedValue.value)
        ? mergedValue.value
        : [mergedValue.value];

  const [val0 = mergedMin.value] = valueList;
  let returnValues = mergedValue.value === null ? [] : [val0];

  // Format as range
  if (rangeEnabled.value) {
    returnValues = [...valueList];

    // When count provided or value is `undefined`, we fill values
    if (count || mergedValue.value === undefined) {
      const pointCount = count >= 0 ? count + 1 : 2;
      returnValues = returnValues.slice(0, pointCount);

      // Fill with count
      while (returnValues.length < pointCount) {
        returnValues.push(returnValues[returnValues.length - 1] ?? mergedMin.value);
      }
    }
    returnValues.sort((a, b) => a - b);
  }

  // Align in range
  returnValues.forEach((val, index) => {
    returnValues[index] = formatValue(val);
  });

  return returnValues;
});

// =========================== onChange ===========================
const getTriggerValue = (triggerValues: number[]) => (rangeEnabled.value ? triggerValues : triggerValues[0]);

const triggerChange = (nextValues: number[]) => {
  // Order first
  const cloneNextValues = [...nextValues].sort((a, b) => a - b);

  // Trigger event if needed
  if (!isEqual(cloneNextValues, rawValues, true)) {
    // We set this later since it will re-render component immediately
    mergedValue.value = getTriggerValue(cloneNextValues);
    onChange?.(getTriggerValue(cloneNextValues));
  }
};

const finishChange = (draggingDelete?: boolean) => {
  // Trigger from `useDrag` will tell if it's a delete action
  if (draggingDelete) {
    handlesRef.value?.hideHelp();
  }

  const finishValue = getTriggerValue(rawValues.value);
  onChangeComplete?.(finishValue);
};

const onDelete = (index: number) => {
  if (disabled || !rangeEditable.value || rawValues.value.length <= minCount.value) {
    return;
  }

  const cloneNextValues = [...rawValues.value];
  cloneNextValues.splice(index, 1);

  triggerChange(cloneNextValues);

  const nextFocusIndex = Math.max(0, index - 1);
  handlesRef.value.hideHelp();
  handlesRef.value.focus(nextFocusIndex);
};

const [draggingIndex, draggingValue, draggingDelete, cacheValues, onStartDrag] = useDrag(
  containerRef,
  direction,
  rawValues,
  mergedMin,
  mergedMax,
  formatValue,
  triggerChange,
  finishChange,
  offsetValues,
  rangeEditable,
  minCount,
);

/**
 * When `rangeEditable` will insert a new value in the values array.
 * Else it will replace the value in the values array.
 */
const changeToCloseValue = (newValue: number, e?: MouseEvent) => {
  if (!disabled) {
    // Create new values
    const cloneNextValues = [...rawValues.value];

    let valueIndex = 0;
    let valueBeforeIndex = 0; // Record the index which value < newValue
    let valueDist = mergedMax.value - mergedMin.value;

    rawValues.value.forEach((val, index) => {
      const dist = Math.abs(newValue - val);
      if (dist <= valueDist) {
        valueDist = dist;
        valueIndex = index;
      }

      if (val < newValue) {
        valueBeforeIndex = index;
      }
    });

    let focusIndex = valueIndex;

    if (rangeEditable.value && valueDist !== 0 && (!maxCount.value || rawValues.value.length < maxCount.value)) {
      cloneNextValues.splice(valueBeforeIndex + 1, 0, newValue);
      focusIndex = valueBeforeIndex + 1;
    } else {
      cloneNextValues[valueIndex] = newValue;
    }

    // Fill value to match default 2 (only when `rawValues` is empty)
    if (rangeEnabled.value && !rawValues.value.length && count === undefined) {
      cloneNextValues.push(newValue);
    }

    const nextValue = getTriggerValue(cloneNextValues);
    triggerChange(cloneNextValues);

    if (e) {
      (document.activeElement as HTMLElement)?.blur?.();
      handlesRef.value.focus(focusIndex);
      onStartDrag(e, focusIndex, cloneNextValues);
    } else {
      onChangeComplete?.(nextValue);
    }
  }
};

// ============================ Click =============================
const onSliderMouseDown = (e: MouseEvent) => {
  e.preventDefault();

  const { width, height, left, top, bottom, right } = containerRef.value.getBoundingClientRect();
  const { clientX, clientY } = e;

  let percent: number;
  switch (direction.value) {
    case 'btt':
      percent = (bottom - clientY) / height;
      break;

    case 'ttb':
      percent = (clientY - top) / height;
      break;

    case 'rtl':
      percent = (right - clientX) / width;
      break;

    default:
      percent = (clientX - left) / width;
  }

  const nextValue = mergedMin.value + percent * (mergedMax.value - mergedMin.value);
  changeToCloseValue(formatValue(nextValue), e);
};

// =========================== Keyboard ===========================
const keyboardValue = ref<number>(null);

const onHandleOffsetChange = (offset: number | 'min' | 'max', valueIndex: number) => {
  if (!disabled) {
    const next = offsetValues(rawValues.value, offset, valueIndex);

    triggerChange(next.values);

    keyboardValue.value = next.value;
  }
};

watch(
  keyboardValue,
  () => {
    if (keyboardValue.value !== null) {
      const valueIndex = rawValues.value.indexOf(keyboardValue.value);
      if (valueIndex >= 0) {
        handlesRef.value?.focus(valueIndex);
      }
    }

    keyboardValue.value = null;
  },
  { immediate: true },
);

// ============================= Drag =============================
const mergedDraggableTrack = computed(() => {
  if (rangeDraggableTrack.value && mergedStep.value === null) {
    if (process.env.NODE_ENV !== 'production') {
      warning(false, '`draggableTrack` is not supported when `step` is `null`.');
    }
    return false;
  }
  return rangeDraggableTrack.value;
});

const onStartMove: OnStartMove = (e, valueIndex) => {
  onStartDrag(e, valueIndex);
};

// Auto focus for updated handle
const dragging = computed(() => draggingIndex.value !== -1);
watch(
  dragging,
  () => {
    if (!dragging.value) {
      const valueIndex = rawValues.value.lastIndexOf(draggingValue.value);
      handlesRef.value?.focus(valueIndex);
    }
  },
  { immediate: true },
);

// =========================== Included ===========================
const sortedCacheValues = computed(() => [...cacheValues.value].sort((a, b) => a - b));

// Provide a range values with included [min, max]
// Used for Track, Mark & Dot
const { includedStart, includedEnd } = toRefs(
  reactiveComputed(() => {
    if (!rangeEnabled.value) {
      return { includedStart: mergedMin, includedEnd: sortedCacheValues.value[0] };
    }

    return {
      includedStart: sortedCacheValues.value[0],
      includedEnd: sortedCacheValues.value[sortedCacheValues.value.length - 1],
    };
  }),
);

// ============================= Refs =============================
defineExpose({
  focus: () => {
    handlesRef.value.focus(0);
  },
  blur: () => {
    const { activeElement } = document;
    if (containerRef.value?.contains(activeElement)) {
      (activeElement as HTMLElement)?.blur();
    }
  },
});

// ========================== Auto Focus ==========================
onMounted(() => {
  if (autofocus) {
    handlesRef.value.focus(0);
  }
});

const context = computed((): SliderContextProps => {
  return {
    min: mergedMin.value,
    max: mergedMax.value,
    direction: direction.value,
    disabled,
    keyboard,
    step: mergedStep.value,
    included,
    includedStart: includedStart.value,
    includedEnd: includedEnd.value,
    range: rangeEnabled.value,
    tabindex,
    ariaLabelForHandle,
    ariaLabelledByForHandle,
    ariaRequired,
    ariaValueTextFormatterForHandle,
    styles: styles || {},
    classNames: classNames || {},
  };
});
</script>
<template>
  <SliderContextProvider :value="context">
    <div
      ref="containerRef"
      :class="
        clsx(prefixCls, className, {
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-vertical`]: vertical,
          [`${prefixCls}-horizontal`]: !vertical,
          [`${prefixCls}-with-marks`]: markList.length,
        })
      "
      :style="style"
      @mousedown="onSliderMouseDown"
      :id="id"
    >
      <div :class="clsx(`${prefixCls}-rail`, classNames?.rail)" :style="{ ...railStyle, ...styles?.rail }"></div>
      <Tracks
        v-if="!track"
        :prefix-cls="prefixCls"
        :style="styles?.tracks"
        :values="rawValues"
        :start-point="startPoint"
        :on-start-move="mergedDraggableTrack ? onStartMove : undefined"
      />
      <Steps :prefix-cls="prefixCls" :marks="markList" :dots="dots" :style="dotStyle" :active-style="activeDotStyle" />
      <Handles
        ref="handlesRef"
        :prefix-cls="prefixCls"
        :style="styles?.handle"
        :values="cacheValues"
        :dragging-index="draggingIndex"
        :dragging-delete="draggingDelete"
        @start-move="onStartMove"
        @offset-change="onHandleOffsetChange"
        @focus="onFocus"
        @blur="onBlur"
        :handle-render="handleRender"
        :active-handle-render="activeHandleRender"
        @change-complete="finishChange"
        :on-delete="rangeEditable ? onDelete : undefined"
      />
      <Marks :prefix-cls="prefixCls" :marks="markList" @click="changeToCloseValue" />
    </div>
  </SliderContextProvider>
</template>
