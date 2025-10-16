<script lang="tsx" setup>
import { computed, toRefs, useId } from 'vue';
import { useTransitionDuration } from '../common';
import type { ProgressProps } from '../interface';
import getIndeterminateCircle from '../utils/getIndeterminateCircle';
import PtgCircle from './PtgCircle.vue';
import { VIEW_BOX_SIZE, getCircleStyle } from './util';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import Render from '@/vc-component/render';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,
  prefixCls = 'rc-progress',
  classNames = {},
  styles = {},
  steps,
  strokeWidth = 1,
  railWidth = 1,
  gapDegree = 0,
  gapPosition = 'bottom',
  railColor = '#D9D9D9',
  strokeLinecap = 'round',
  style,
  class: className,
  strokeColor = '#2db7f5',
  percent = 0,
  loading,
  ...restProps
} = defineProps<ProgressProps>();

function toArray<T>(value: T | T[]): T[] {
  const mergedValue = value ?? [];
  return Array.isArray(mergedValue) ? mergedValue : [mergedValue];
}

const halfSize = VIEW_BOX_SIZE / 2;

const mergedId = useId();
const gradientId = `${mergedId}-gradient`;
const radius = computed(() => halfSize - strokeWidth / 2);
const perimeter = computed(() => Math.PI * 2 * radius.value);
const rotateDeg = computed(() => (gapDegree > 0 ? 90 + gapDegree / 2 : -90));
const perimeterWithoutGap = computed(() => perimeter.value * ((360 - gapDegree) / 360));
const { count: stepCount, gap: stepGap } = toRefs(
  reactiveComputed(() => (typeof steps === 'object' ? steps : { count: steps, gap: 2 })),
);

const percentList = computed(() => toArray(percent));
const strokeColorList = computed(() => toArray(strokeColor));
const gradient = computed(
  () => strokeColorList.value.find((color) => color && typeof color === 'object') as Record<string, string>,
);
const isConicGradient = computed(() => gradient.value && typeof gradient.value === 'object');
const mergedStrokeLinecap = computed(() => (isConicGradient.value ? 'butt' : strokeLinecap));
const { indeterminateStyleProps, indeterminateStyleAnimation } = toRefs(
  reactiveComputed(() =>
    getIndeterminateCircle({
      id: mergedId,
      loading,
    }),
  ),
);

const circleStyle = computed(() =>
  getCircleStyle(
    perimeter.value,
    perimeterWithoutGap.value,
    0,
    100,
    rotateDeg.value,
    gapDegree,
    gapPosition,
    railColor,
    mergedStrokeLinecap.value,
    strokeWidth,
  ),
);

const paths = useTransitionDuration();

const getStokeList = () => {
  let stackPtg = 0;
  return percentList.value
    .map((ptg, index) => {
      const color = strokeColorList.value[index] || strokeColorList.value[strokeColorList.value.length - 1];
      const circleStyleForStack = getCircleStyle(
        perimeter.value,
        perimeterWithoutGap.value,
        stackPtg,
        ptg,
        rotateDeg.value,
        gapDegree,
        gapPosition,
        color,
        mergedStrokeLinecap.value,
        strokeWidth,
      );
      stackPtg += ptg;

      return (
        <PtgCircle
          key={index}
          color={color}
          ptg={ptg}
          radius={radius.value}
          prefixCls={prefixCls}
          gradientId={gradientId}
          class={classNames.track}
          style={{ ...circleStyleForStack, ...indeterminateStyleProps.value, ...styles.track }}
          strokeLinecap={mergedStrokeLinecap.value}
          strokeWidth={strokeWidth}
          gapDegree={gapDegree}
          ref={(elem) => {
            // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
            // React will call the ref callback with the DOM element when the component mounts,
            // and call it with `null` when it unmounts.
            // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.
            paths.value[index] = elem as SVGPathElement;
          }}
          size={VIEW_BOX_SIZE}
        />
      );
    })
    .reverse();
};

const getStepStokeList = () => {
  // only show the first percent when pass steps
  const current = Math.round(stepCount.value * (percentList.value[0] / 100));
  const stepPtg = 100 / stepCount.value;

  let stackPtg = 0;
  return Array.from({ length: stepCount.value })
    .fill(null)
    .map((_, index) => {
      const color = index <= current - 1 ? strokeColorList.value[0] : railColor;
      const stroke = color && typeof color === 'object' ? `url(#${gradientId})` : undefined;
      const circleStyleForStack = getCircleStyle(
        perimeter.value,
        perimeterWithoutGap.value,
        stackPtg,
        stepPtg,
        rotateDeg.value,
        gapDegree,
        gapPosition,
        color,
        'butt',
        strokeWidth,
        stepGap.value,
      );
      stackPtg +=
        ((perimeterWithoutGap.value - (circleStyleForStack.strokeDashoffset as number) + stepGap.value) * 100) /
        perimeterWithoutGap.value;

      return (
        <circle
          key={index}
          class={clsx(`${prefixCls}-circle-path`, classNames.track)}
          r={radius.value}
          cx={halfSize}
          cy={halfSize}
          stroke={stroke}
          stroke-width={strokeWidth}
          opacity={1}
          style={{ ...circleStyleForStack, ...styles.track }}
          ref={(elem) => {
            paths.value[index] = elem as SVGPathElement;
          }}
        />
      );
    });
};
</script>
<template>
  <svg
    :class="clsx(`${prefixCls}-circle`, classNames.root, className)"
    :viewBox="`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`"
    :style="{
      ...styles.root,
      ...style,
    }"
    :id="id"
    role="presentation"
    v-bind="restProps"
  >
    <circle
      v-if="!stepCount"
      :class="clsx(`${prefixCls}-circle-rail`, classNames.rail)"
      :r="radius"
      :cx="halfSize"
      :cy="halfSize"
      :stroke="railColor"
      :stroke-linecap="mergedStrokeLinecap"
      :stroke-width="railWidth || strokeWidth"
      :style="{
        ...circleStyle,
        ...styles.rail,
      }"
    />
    <Render :content="stepCount ? getStepStokeList : getStokeList" />
    <Render :content="indeterminateStyleAnimation" />
  </svg>
</template>
