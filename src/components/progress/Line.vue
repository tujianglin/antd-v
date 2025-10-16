<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, getCurrentInstance, type CSSProperties } from 'vue';
import type { DirectionType } from '../config-provider';
import type { PercentPositionType, ProgressGradient, ProgressProps } from './progress.vue';
import { LineStrokeColorVar } from './style';
import { getSize, getSuccessPercent, handleGradient, validProgress } from './utils';

interface LineProps extends ProgressProps {
  prefixCls: string;
  direction?: DirectionType;
  strokeColor?: string | ProgressGradient;
  percentPosition: PercentPositionType;
  classNames: Required<ProgressProps>['classNames'];
  styles: Required<ProgressProps>['styles'];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  classNames,
  styles,
  direction: directionConfig,
  percent,
  size,
  strokeWidth,
  strokeColor,
  strokeLinecap = 'round',
  railColor,
  percentPosition,
  success,
} = defineProps<LineProps>();

const infoAlign = computed(() => percentPosition.align);
const infoPosition = computed(() => percentPosition.type);

const borderRadius = computed(() => (strokeLinecap === 'square' || strokeLinecap === 'butt' ? 0 : undefined));

// ========================= Size =========================
const mergedSize = computed<LineProps['size']>(() => size ?? [-1, strokeWidth || (size === 'small' ? 6 : 8)]);
const wh = computed(() => getSize(mergedSize.value, 'line', { strokeWidth }));
const width = computed(() => wh.value[0]);
const height = computed(() => wh.value[1]);

// ========================= Rail =========================
const railStyle = computed<CSSProperties>(() => ({
  backgroundColor: railColor || undefined,
  borderRadius: `${borderRadius.value}px`,
  height: `${height.value}px`,
}));

// ======================== Tracks ========================
const trackCls = computed(() => `${prefixCls}-track`);

const backgroundProps = computed(() =>
  strokeColor && typeof strokeColor !== 'string'
    ? handleGradient(strokeColor, directionConfig)
    : { [LineStrokeColorVar]: strokeColor, background: strokeColor },
);

const percentTrackStyle = computed(() => {
  return {
    width: `${validProgress(percent)}%`,
    height: `${height.value}px`,
    borderRadius: `${borderRadius.value}px`,
    ...backgroundProps.value,
  } as CSSProperties;
});

const vm = getCurrentInstance() as unknown as { props: LineProps };
const successPercent = computed(() => getSuccessPercent(vm.props));

const successTrackStyle = computed(() => {
  return {
    width: `${validProgress(successPercent.value)}%`,
    height: `${height.value}px`,
    borderRadius: `${borderRadius.value}px`,
    backgroundColor: success?.strokeColor,
  } as CSSProperties;
});
</script>
<template>
  <div
    :class="
      clsx(`${prefixCls}-body`, classNames.body, {
        [`${prefixCls}-body-layout-bottom`]: infoAlign === 'center' && infoPosition === 'outer',
      })
    "
    :style="{ width: width > 0 ? `${width}px` : '100%', ...styles.body }"
  >
    <div
      :class="clsx(`${prefixCls}-rail`, classNames.rail)"
      :style="{
        ...railStyle,
        ...styles.rail,
      }"
    >
      <div
        :class="clsx(trackCls, classNames.track)"
        :style="{
          ...percentTrackStyle,
          ...styles.track,
        }"
      >
        <template v-if="infoPosition === 'inner'">
          <slot></slot>
        </template>
      </div>
      <div
        v-if="successPercent !== undefined"
        :class="clsx(trackCls, `${trackCls}-success`, classNames.track)"
        :style="{
          ...successTrackStyle,
          ...styles.track,
        }"
      ></div>
    </div>
    <template v-if="infoPosition === 'outer'"><slot></slot></template>
  </div>
</template>
