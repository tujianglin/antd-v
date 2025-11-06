<script lang="tsx" setup>
import type { ProgressProps as RcProgressProps } from '@/vc-component/progress';
import { Circle as RCCircle } from '@/vc-component/progress';
import { useComponentConfig } from '../config-provider/context';
import Tooltip from '../tooltip';
import type { GapPosition, ProgressGradient, ProgressProps, SemanticName } from './progress.vue';
import { getPercentage, getSize, getStrokeColor } from './utils';
import { computed, getCurrentInstance, toRefs, type VNode } from 'vue';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';

export interface CircleProps extends ProgressProps {
  prefixCls: string;
  progressStatus: string;
  strokeColor?: string | ProgressGradient;
  classNames: SemanticClassNames<SemanticName>;
  styles: SemanticStyles<SemanticName>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  classNames,
  styles,
  railColor,
  strokeLinecap = 'round',
  gapPlacement,
  gapDegree,
  type,
  success,
  size = 120,
  steps,
} = defineProps<CircleProps>();

const slots = defineSlots<{ default: () => VNode[] }>();

const CIRCLE_MIN_STROKE_WIDTH = 3;

const getMinPercent = (width: number): number => (CIRCLE_MIN_STROKE_WIDTH / width) * 100;

const OMIT_SEMANTIC_NAMES = ['root', 'body', 'indicator'] as const;

const { direction } = toRefs(useComponentConfig('progress'));

const wh = computed(() => getSize(size, 'circle'));
const width = computed(() => wh.value[0]);
const height = computed(() => wh.value[1]);

const vm = getCurrentInstance() as unknown as { props: CircleProps };

const strokeWidth = computed(() => {
  let result = vm.props?.strokeWidth;
  if (result === undefined) {
    result = Math.max(getMinPercent(width.value), 6);
  }
  return result;
});

const circleStyle = computed(() => ({
  width: `${width.value}px`,
  height: `${height.value}px`,
  fontSize: `${width.value * 0.15 + 6}px`,
}));

const realGapDegree = computed<RcProgressProps['gapDegree']>(() => {
  // Support gapDeg = 0 when type = 'dashboard'
  if (gapDegree || gapDegree === 0) {
    return gapDegree;
  }
  if (type === 'dashboard') {
    return 75;
  }
  return undefined;
});

const percentArray = computed(() => getPercentage(vm.props));
const gapPos = computed<GapPosition | undefined>(() => {
  const mergedPlacement = gapPlacement || (type === 'dashboard' && 'bottom') || undefined;
  const isRTL = direction.value === 'rtl';
  switch (mergedPlacement) {
    case 'start':
      return isRTL ? 'right' : 'left';
    case 'end':
      return isRTL ? 'left' : 'right';
    default:
      return mergedPlacement;
  }
});

// using className to style stroke color
const isGradient = computed(() => Object.prototype.toString.call(vm.props?.strokeColor) === '[object Object]');
const strokeColor = computed(() => getStrokeColor({ success, strokeColor: vm.props?.strokeColor }));

const wrapperClassName = computed(() =>
  clsx(
    `${prefixCls}-body`,
    {
      [`${prefixCls}-circle-gradient`]: isGradient.value,
    },
    classNames.body,
  ),
);

const CircleContent = () => {
  return (
    <RCCircle
      steps={steps}
      percent={steps ? percentArray.value[1] : percentArray.value}
      strokeWidth={strokeWidth.value}
      railWidth={strokeWidth.value}
      strokeColor={steps ? strokeColor.value[1] : strokeColor.value}
      strokeLinecap={strokeLinecap}
      railColor={railColor}
      prefixCls={prefixCls}
      gapDegree={realGapDegree.value}
      gapPosition={gapPos.value}
      classNames={omit(classNames, OMIT_SEMANTIC_NAMES)}
      styles={omit(styles, OMIT_SEMANTIC_NAMES)}
    />
  );
};

const smallCircle = computed(() => width.value <= 20);
const Node = () => (
  <div class={wrapperClassName.value} style={{ ...circleStyle.value, ...styles.body }}>
    <CircleContent></CircleContent>
    {!smallCircle.value && slots.default?.()}
  </div>
);
</script>
<template>
  <Tooltip v-if="smallCircle" :title="slots.default?.()">
    <Node />
  </Tooltip>
  <Node v-else />
</template>
