<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { ref } from 'vue';
import type { Color } from '../color';
import useColorDrag from '../hooks/useColorDrag';
import type { BaseColorPickerProps, TransformOffset } from '../interface';
import { calcOffset, calculateColor } from '../util';
import Handler from './Handler.vue';
import Palette from './Palette.vue';
import Transform from './Transform.vue';

export type PickerProps = BaseColorPickerProps;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { color, onChange, prefixCls, onChangeComplete, disabled } = defineProps<PickerProps>();

const pickerRef = ref();
const transformRef = ref();
const colorRef = ref(color);

const onDragChange = (offsetValue: TransformOffset) => {
  const calcColor = calculateColor({
    offset: offsetValue,
    targetRef: transformRef.value?.el,
    containerRef: pickerRef.value,
    color,
  });
  colorRef.value = calcColor;
  onChange(calcColor);
};

const [offset, dragStartHandle] = useColorDrag(
  reactiveComputed(() => {
    return {
      color,
      containerRef: pickerRef.value,
      targetRef: transformRef.value?.el,
      calculate: () => calcOffset(color),
      onDragChange,
      onDragChangeComplete: () => onChangeComplete?.(colorRef.value as Color),
      disabledDrag: disabled,
    };
  }),
);
</script>
<template>
  <div ref="pickerRef" :class="`${prefixCls}-select`" @mousedown="dragStartHandle" @touchstart="dragStartHandle">
    <Palette :prefix-cls="prefixCls">
      <Transform :x="offset.x" :y="offset.y" ref="transformRef">
        <Handler :color="color.toRgbString()" :prefix-cls="prefixCls" />
      </Transform>
      <div
        :class="`${prefixCls}-saturation`"
        :style="{
          backgroundColor: `hsl(${color.toHsb().h},100%, 50%)`,
          backgroundImage: 'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))',
        }"
      ></div>
    </Palette>
  </div>
</template>
