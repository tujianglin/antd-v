<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, ref, toRefs, watch, watchEffect } from 'vue';
import { useQRCode } from './hooks/useQRCode';
import type { ImageSettings, QRPropsCanvas } from './interface';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_NEED_MARGIN,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
  isSupportPath2d,
} from './utils';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  value,
  size = DEFAULT_SIZE,
  level = DEFAULT_LEVEL,
  bgColor = DEFAULT_BACKGROUND_COLOR,
  fgColor = DEFAULT_FRONT_COLOR,
  includeMargin = DEFAULT_NEED_MARGIN,
  minVersion = DEFAULT_MINVERSION,
  marginSize,
  style,
  imageSettings = {} as ImageSettings,
  ...otherProps
} = defineProps<QRPropsCanvas>();
const imgSrc = computed(() => imageSettings?.src);
const _canvas = ref<HTMLCanvasElement>(null);
const _image = ref<HTMLImageElement>(null);

const setCanvasRef = (node) => {
  _canvas.value = node;
};

const isImageLoaded = ref(false);

const { margin, cells, numCells, calculatedImageSettings } = toRefs(
  useQRCode(
    reactiveComputed(() => {
      return {
        value,
        level,
        minVersion,
        includeMargin,
        marginSize,
        imageSettings,
        size,
      };
    }),
  ),
);

watchEffect(() => {
  if (_canvas.value) {
    const canvas = _canvas.value;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let cellsToDraw = cells.value;
    const image = _image.value;
    const haveImageToRender =
      calculatedImageSettings.value !== null &&
      image !== null &&
      image.complete &&
      image.naturalHeight !== 0 &&
      image.naturalWidth !== 0;

    if (haveImageToRender) {
      if (calculatedImageSettings.value.excavation !== null) {
        cellsToDraw = excavateModules(cells.value, calculatedImageSettings.value.excavation);
      }
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.height = canvas.width = size * pixelRatio;
    const scale = (size / numCells.value) * pixelRatio;
    ctx.scale(scale, scale);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, numCells.value, numCells.value);
    ctx.fillStyle = fgColor;
    if (isSupportPath2d) {
      ctx.fill(new Path2D(generatePath(cellsToDraw, margin.value)));
    } else {
      cells.value.forEach((row, rdx) => {
        row.forEach((cell, cdx) => {
          if (cell) {
            ctx.fillRect(cdx + margin.value, rdx + margin.value, 1, 1);
          }
        });
      });
    }

    if (calculatedImageSettings.value) {
      ctx.globalAlpha = calculatedImageSettings.value.opacity;
    }

    if (haveImageToRender) {
      ctx.drawImage(
        image,
        calculatedImageSettings.value.x + margin.value,
        calculatedImageSettings.value.y + margin.value,
        calculatedImageSettings.value.w,
        calculatedImageSettings.value.h,
      );
    }
  }
});

watch(
  () => imgSrc,
  () => {
    isImageLoaded.value = false;
  },
  { immediate: true },
);

const canvasStyle = computed(() => {
  return {
    height: `${size}px`,
    width: `${size}px`,
    ...style,
  };
});
</script>
<template>
  <canvas :style="canvasStyle" :height="size" :width="size" :ref="setCanvasRef" role="img" v-bind="otherProps"></canvas>
  <img
    v-if="imgSrc !== null"
    :src="imgSrc"
    :key="imgSrc"
    :style="{ display: 'none' }"
    @load="isImageLoaded = true"
    ref="_image"
    :crossorigin="calculatedImageSettings.crossOrigin"
  />
</template>
