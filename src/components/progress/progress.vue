<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { FastColor } from '@ant-design/fast-color';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';
import { getSize, getSuccessPercent, validProgress } from './utils';
import { ProgressStatuses, type ProgressType } from './interface';
import type { VueNode } from '@/vc-util/type';
import { CheckCircleFilled, CheckOutlined, CloseCircleFilled, CloseOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import { omit } from 'es-toolkit/compat';
import Steps from './Steps.vue';
import Line from './Line.vue';
import Circle from './Circle.vue';
import { isArray } from 'es-toolkit/compat';

export type SemanticName = 'root' | 'body' | 'rail' | 'track' | 'indicator';

export type ProgressClassNamesType = SemanticClassNamesType<ProgressProps, SemanticName>;

export type ProgressStylesType = SemanticStylesType<ProgressProps, SemanticName>;

export type ProgressSize = 'default' | 'small';
export type StringGradients = Record<string, string>;
type FromToGradients = { from: string; to: string };
export type ProgressGradient = { direction?: string } & (StringGradients | FromToGradients);
export interface PercentPositionType {
  align?: 'start' | 'center' | 'end';
  type?: 'inner' | 'outer';
}

export interface SuccessProps {
  percent?: number;
  strokeColor?: string;
}

export type ProgressAriaProps = { 'aria-label'?: string; 'aria-labelledby'?: string };

export type GapPlacement = 'top' | 'bottom' | 'start' | 'end';
export type GapPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ProgressProps extends ProgressAriaProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  classNames?: ProgressClassNamesType;
  styles?: ProgressStylesType;

  type?: ProgressType;
  percent?: number;
  format?: (percent?: number, successPercent?: number) => VueNode;
  status?: (typeof ProgressStatuses)[number];
  showInfo?: boolean;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'square' | 'round';
  strokeColor?: string | string[] | ProgressGradient;
  railColor?: string;
  success?: SuccessProps;
  style?: CSSProperties;
  gapDegree?: number;
  gapPlacement?: GapPlacement;
  size?: number | [number | string, number] | ProgressSize | { width?: number; height?: number };
  steps?: number | { count: number; gap: number };
  percentPosition?: PercentPositionType;
  rounding?: (step: number) => number;
}
defineOptions({ name: 'Progress', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  classNames,
  styles,
  steps,
  strokeColor,
  percent = 0,
  size = 'default',
  showInfo = true,
  type = 'line',
  status,
  format,
  style,
  percentPosition = {},
  ...restProps
} = defineProps<ProgressProps>();

// ========================= MISC =========================
const infoAlign = computed(() => percentPosition.align || 'end');
const infoPosition = computed(() => percentPosition.type || 'outer');
const strokeColorNotArray = computed(() => (isArray(strokeColor) ? strokeColor[0] : strokeColor));
const strokeColorNotGradient = computed(() =>
  typeof strokeColor === 'string' || isArray(strokeColor) ? strokeColor : undefined,
);
const strokeColorIsBright = computed(() => {
  if (strokeColorNotArray.value) {
    const color =
      typeof strokeColorNotArray.value === 'string' ? strokeColorNotArray.value : Object.values(strokeColorNotArray.value)[0];
    return new FastColor(color).isLight();
  }
  return false;
});

const vm = getCurrentInstance() as unknown as { props: ProgressProps };

const percentNumber = computed<number>(() => {
  const successPercent = getSuccessPercent(vm.props);
  return parseInt(successPercent !== undefined ? (successPercent ?? 0)?.toString() : (percent ?? 0)?.toString(), 10);
});

const progressStatus = computed<(typeof ProgressStatuses)[number]>(() => {
  if (!ProgressStatuses.includes(status!) && percentNumber.value >= 100) {
    return 'success';
  }
  return status || 'normal';
});

// ======================= Context ========================
const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('progress'));

const prefixCls = computed(() => getPrefixCls.value('progress', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

// ======================== Styles ========================
const [mergedClassNames, mergedStyles] = useMergeSemantic<ProgressClassNamesType, ProgressStylesType, ProgressProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      percent,
      type,
      size,
      showInfo,
      percentPosition,
    },
  })),
);

// ========================= Info =========================
const isLineType = computed(() => type === 'line');
const isPureLineType = computed(() => isLineType?.value && !steps);
const ProgressInfo = () => {
  if (!showInfo) {
    return null;
  }
  const successPercent = getSuccessPercent(vm.props);
  let text: VueNode;
  const textFormatter = format || ((number) => `${number}%`);
  const isBrightInnerColor = isLineType.value && strokeColorIsBright.value && infoPosition.value === 'inner';
  if (infoPosition.value === 'inner' || format || (progressStatus.value !== 'exception' && progressStatus.value !== 'success')) {
    text = textFormatter(validProgress(percent), validProgress(successPercent));
  } else if (progressStatus.value === 'exception') {
    text = isLineType.value ? <CloseCircleFilled /> : <CloseOutlined />;
  } else if (progressStatus.value === 'success') {
    text = isLineType.value ? <CheckCircleFilled /> : <CheckOutlined />;
  }

  return (
    <span
      class={clsx(
        `${prefixCls.value}-indicator`,
        {
          [`${prefixCls.value}-indicator-bright`]: isBrightInnerColor,
          [`${prefixCls.value}-indicator-${infoAlign.value}`]: isPureLineType.value,
          [`${prefixCls.value}-indicator-${infoPosition.value}`]: isPureLineType.value,
        },
        mergedClassNames.value?.indicator,
      )}
      style={mergedStyles.value?.indicator}
      title={typeof text === 'string' ? text : undefined}
    >
      <Render content={text}></Render>
    </span>
  );
};

// ======================== Render ========================
const sharedProps = computed(() => ({
  ...vm.props,
  classNames: mergedClassNames.value,
  styles: mergedStyles.value,
}));

const classString = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-status-${progressStatus.value}`,
    {
      [`${prefixCls.value}-${(type === 'dashboard' && 'circle') || type}`]: type !== 'line',
      [`${prefixCls.value}-inline-circle`]: type === 'circle' && getSize(size, 'circle')[0] <= 20,
      [`${prefixCls.value}-line`]: isPureLineType.value,
      [`${prefixCls.value}-line-align-${infoAlign.value}`]: isPureLineType.value,
      [`${prefixCls.value}-line-position-${infoPosition.value}`]: isPureLineType.value,
      [`${prefixCls.value}-steps`]: steps,
      [`${prefixCls.value}-show-info`]: showInfo,
      [`${prefixCls.value}-${size}`]: typeof size === 'string',
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    contextClassName?.value,
    className,
    rootClassName,
    mergedClassNames.value?.root,
    hashId.value,
    cssVarCls.value,
  ),
);
</script>
<template>
  <div
    :style="{ ...contextStyle, ...mergedStyles.root, ...style }"
    :class="classString"
    role="progressbar"
    :aria-valuenow="percentNumber"
    :aria-valuemin="0"
    :aria-valuemax="100"
    v-bind="{
      ...omit(restProps, [
        'railColor',
        'trailColor',
        'strokeWidth',
        'width',
        'gapDegree',
        'gapPosition',
        'gapPlacement',
        'strokeLinecap',
        'success',
      ]),
      ...$attrs,
    }"
  >
    <template v-if="type === 'line'">
      <Steps
        v-if="steps"
        v-bind="sharedProps"
        :stroke-color="strokeColorNotGradient"
        :prefix-cls="prefixCls"
        :steps="typeof steps === 'object' ? steps.count : steps"
      >
        <ProgressInfo />
      </Steps>
      <Line
        v-else
        v-bind="sharedProps"
        :stroke-color="strokeColorNotArray"
        :prefix-cls="prefixCls"
        :direction="direction"
        :percent-position="{ align: infoAlign, type: infoPosition }"
      >
        <ProgressInfo />
      </Line>
    </template>
    <Circle
      v-if="type === 'circle' || type === 'dashboard'"
      v-bind="sharedProps"
      :stroke-color="strokeColorNotArray"
      :prefix-cls="prefixCls"
      :progress-status="progressStatus"
    >
      <ProgressInfo />
    </Circle>
  </div>
</template>
