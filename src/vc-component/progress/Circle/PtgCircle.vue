<script lang="tsx" setup>
import { computed, getCurrentInstance, type CSSProperties } from 'vue';
import type { ProgressProps } from '..';
import type { StrokeColorObject } from '../interface';
import clsx from 'clsx';
import { Render } from '@/components';

export interface ColorGradientProps {
  prefixCls: string;
  class?: string;
  gradientId: string;
  style: CSSProperties;
  ptg: number;
  radius: number;
  strokeLinecap: ProgressProps['strokeLinecap'];
  strokeWidth: ProgressProps['strokeWidth'];
  size: number;
  color: string | StrokeColorObject;
  gapDegree: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  color,
  gradientId,
  radius,
  class: className,
  style: circleStyleForStack,
  ptg,
  strokeLinecap,
  strokeWidth,
  size,
  gapDegree,
} = defineProps<ColorGradientProps>();

function getPtgColors(color, scale: number) {
  return Object.keys(color).map((key) => {
    const parsedKey = parseFloat(key);
    const ptgKey = `${Math.floor(parsedKey * scale)}%`;

    return `${color[key]} ${ptgKey}`;
  });
}

const isGradient = computed(() => color && typeof color === 'object');

const stroke = computed(() => (isGradient.value ? `#FFF` : undefined));

// ========================== Circle ==========================
const halfSize = computed(() => size / 2);

const vm = getCurrentInstance();
const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};

const circleNode = () => {
  return (
    <circle
      class={clsx(`${prefixCls}-circle-path`, className)}
      r={radius}
      cx={halfSize.value}
      cy={halfSize.value}
      stroke={stroke.value}
      stroke-linecap={strokeLinecap}
      stroke-width={strokeWidth}
      opacity={ptg === 0 ? 0 : 1}
      style={circleStyleForStack}
      ref={changeRef}
    />
  );
};

// ========================== Render ==========================

const maskId = computed(() => `${gradientId}-conic`);

const fromDeg = computed(() => (gapDegree ? `${180 + gapDegree / 2}deg` : '0deg'));

const conicColors = computed(() => getPtgColors(color, (360 - gapDegree) / 360));
const linearColors = computed(() => getPtgColors(color, 1));

const conicColorBg = computed(() => `conic-gradient(from ${fromDeg.value}, ${conicColors.value.join(', ')})`);
const linearColorBg = `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${linearColors.value.join(', ')})`;
</script>
<template>
  <template v-if="!isGradient">
    <Render :content="circleNode" />
  </template>
  <template v-else>
    <mask :id="maskId">
      <Render :content="circleNode" />
    </mask>
    <foreignObject :x="0" :y="0" :width="size" :height="size" :mask="`url(#${maskId})`">
      <div :style="{ width: '100%', height: '100%', background: linearColorBg }">
        <div :style="{ width: '100%', height: '100%', background: conicColorBg }"></div>
      </div>
    </foreignObject>
  </template>
</template>
