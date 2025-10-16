<script lang="tsx" setup>
import { computed, ref, toRefs } from 'vue';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_NEED_MARGIN,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
} from './utils';
import { useQRCode } from './hooks/useQRCode';
import type { QRPropsSVG } from './interface';
import { reactiveComputed } from '@vueuse/core';
import Render from '@/vc-component/render';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  value,
  size = DEFAULT_SIZE,
  level = DEFAULT_LEVEL,
  bgColor = DEFAULT_BACKGROUND_COLOR,
  fgColor = DEFAULT_FRONT_COLOR,
  includeMargin = DEFAULT_NEED_MARGIN,
  minVersion = DEFAULT_MINVERSION,
  title,
  marginSize,
  imageSettings,
  ...otherProps
} = defineProps<QRPropsSVG>();

const { margin, cells, numCells, calculatedImageSettings } = toRefs(
  useQRCode(
    reactiveComputed(() => ({
      value,
      level,
      minVersion,
      includeMargin,
      marginSize,
      imageSettings,
      size,
    })),
  ),
);

const cellsToDraw = ref(cells.value);
const image = () => {
  let result = null;
  if (imageSettings !== null && calculatedImageSettings?.value !== null) {
    if (calculatedImageSettings?.value?.excavation !== null) {
      cellsToDraw.value = excavateModules(cells.value, calculatedImageSettings?.value?.excavation);
    }

    result = (
      <image
        href={imageSettings.src}
        height={calculatedImageSettings.value.h}
        width={calculatedImageSettings.value.w}
        x={calculatedImageSettings.value.x + margin.value}
        y={calculatedImageSettings.value.y + margin.value}
        preserveAspectRatio="none"
        opacity={calculatedImageSettings.value.opacity}
        // when crossOrigin is not set, the image will be tainted
        // and the canvas cannot be exported to an image
        crossOrigin={calculatedImageSettings.value.crossOrigin}
      />
    );
  }
  return result;
};

const fgPath = computed(() => generatePath(cellsToDraw.value, margin.value));

const domRef = ref();
</script>
<template>
  <svg :height="size" :width="size" :viewBox="`0 0 ${numCells} ${numCells}`" ref="domRef" role="img" v-bind="otherProps">
    <title v-if="!!title">{{ title }}</title>
    <path :fill="bgColor" :d="`M0,0 h${numCells}v${numCells}H0z`" shapeRendering="crispEdges" />
    <path :fill="fgColor" :d="fgPath" shapeRendering="crispEdges" />
    <Render :content="image" />
  </svg>
</template>
