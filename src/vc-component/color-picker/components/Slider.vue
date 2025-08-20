<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref } from 'vue';
import { Color } from '../color';
import useColorDrag from '../hooks/useColorDrag';
import type { HsbaColorType, TransformOffset } from '../interface';
import { calcOffset, calculateColor } from '../util';
import Gradient from './Gradient.vue';
import Handler from './Handler.vue';
import Palette from './Palette.vue';
import Transform from './Transform.vue';

export interface BaseSliderProps {
  prefixCls: string;
  colors: { percent: number; color: string }[];
  min: number;
  max: number;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
  onChangeComplete: (value: number) => void;
  type: HsbaColorType;
  color: Color;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, colors, disabled, onChange, onChangeComplete, color, type } = defineProps<BaseSliderProps>();

const sliderRef = ref();
const transformRef = ref();
const colorRef = ref(color);

const getValue = (c: Color) => {
  return type === 'hue' ? c.getHue() : c.a * 100;
};

const onDragChange = (offsetValue: TransformOffset) => {
  const calcColor = calculateColor({
    offset: offsetValue,
    targetRef: transformRef.value?.el,
    containerRef: sliderRef.value,
    color,
    type,
  });

  colorRef.value = calcColor;
  onChange(getValue(calcColor));
};

const [offset, dragStartHandle] = useColorDrag(
  reactiveComputed(() => ({
    color,
    targetRef: transformRef.value?.el,
    containerRef: sliderRef.value,
    calculate: () => calcOffset(color, type),
    onDragChange,
    onDragChangeComplete() {
      onChangeComplete(getValue(colorRef.value as Color));
    },
    direction: 'x',
    disabledDrag: disabled,
  })),
);

const handleColor = computed(() => {
  if (type === 'hue') {
    const hsb = color.toHsb();
    hsb.s = 1;
    hsb.b = 1;
    hsb.a = 1;

    const lightColor = new Color(hsb);
    return lightColor;
  }

  return color;
});

// ========================= Gradient =========================
const gradientList = computed(() => colors.map((info) => `${info.color} ${info.percent}%`));
</script>
<template>
  <div
    ref="sliderRef"
    :class="clsx(`${prefixCls}-slider`, `${prefixCls}-slider-${type}`)"
    @mousedown="dragStartHandle"
    @touchstart="dragStartHandle"
  >
    <Palette :prefix-cls="prefixCls">
      <Transform :x="offset.x" :y="offset.y" ref="transformRef">
        <Handler size="small" :color="handleColor.toHexString()" :prefix-cls="prefixCls" />
      </Transform>
      <Gradient :colors="gradientList" :type="type" :prefix-cls="prefixCls" />
    </Palette>
  </div>
</template>
