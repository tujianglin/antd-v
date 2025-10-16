<script lang="tsx" setup>
import clsx from 'clsx';
import { isArray } from 'lodash-es';
import { computed } from 'vue';
import type { ProgressProps } from './progress.vue';
import { getSize } from './utils';

interface ProgressStepsProps extends ProgressProps {
  steps: number;
  strokeColor?: string | string[];
  railColor?: string;
  classNames: Required<ProgressProps>['classNames'];
  styles: Required<ProgressProps>['styles'];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  classNames,
  styles,
  size,
  steps,
  rounding: customRounding = Math.round,
  percent = 0,
  strokeWidth = 8,
  strokeColor,
  railColor,
  prefixCls,
} = defineProps<ProgressStepsProps>();
const current = computed(() => customRounding(steps * (percent / 100)));
const stepWidth = computed(() => (size === 'small' ? 2 : 14));
const mergedSize = computed<ProgressStepsProps['size']>(() => size ?? [stepWidth.value, strokeWidth]);
const wh = computed(() => getSize(mergedSize.value, 'step', { steps, strokeWidth }));
const width = computed(() => wh.value[0]);
const height = computed(() => wh.value[1]);
const unitWidth = computed(() => width.value / steps);
</script>
<template>
  <div :class="clsx(`${prefixCls}-steps-body`, classNames.body)" :style="styles.body">
    <div
      v-for="i in steps"
      :key="i"
      :class="
        clsx(
          `${prefixCls}-steps-item`,
          {
            [`${prefixCls}-steps-item-active`]: i <= current - 1,
          },
          classNames.track,
        )
      "
      :style="{
        backgroundColor: i <= current - 1 ? (isArray(strokeColor) ? strokeColor[i] : strokeColor) : railColor,
        width: `${unitWidth}px`,
        height: `${height}px`,
        ...styles.track,
      }"
    ></div>
    <slot></slot>
  </div>
</template>
