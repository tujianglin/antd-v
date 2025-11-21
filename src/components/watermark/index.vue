<script lang="tsx" setup>
import { useMutateObserver } from '@/vc-component/mutate-observer';
import clsx from 'clsx';
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import toList from '../_util/toList';
import { useComponentConfig } from '../config-provider/context';
import { useToken } from '../theme/internal';
import { WatermarkContextProvider, type WatermarkContextProps } from './context';
import useClips, { FontGap } from './useClips';
import useRafDebounce from './useRafDebounce';
import useSingletonCache from './useSingletonCache';
import useWatermark from './useWatermark';
import { getPixelRatio, reRendering } from './utils';

export interface WatermarkProps {
  zIndex?: number;
  rotate?: number;
  width?: number;
  height?: number;
  image?: string;
  content?: string | string[];
  font?: {
    color?: CanvasFillStrokeStyles['fillStyle'];
    fontSize?: number | string;
    fontWeight?: 'normal' | 'light' | 'weight' | number;
    fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
    fontFamily?: string;
    textAlign?: CanvasTextAlign;
  };
  style?: CSSProperties;
  class?: string;
  rootClassName?: string;
  gap?: [number, number];
  offset?: [number, number];
  inherit?: boolean;
  /**
   * @since 6.0.0
   */
  onRemove?: () => void;
}

defineOptions({ name: 'Watermark', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  /**
   * The antd content layer zIndex is basically below 10
   * https://github.com/ant-design/ant-design/blob/6192403b2ce517c017f9e58a32d58774921c10cd/components/style/themes/default.less#L335
   */
  zIndex = 9,
  rotate = -22,
  width,
  height,
  image,
  content,
  font = {},
  style,
  class: className,
  rootClassName,
  gap = [100, 100],
  offset,
  inherit = true,
  onRemove,
} = defineProps<WatermarkProps>();

/**
 * Only return `next` when size changed.
 * This is only used for elements compare, not a shallow equal!
 */
function getSizeDiff<T>(prev: Set<T>, next: Set<T>) {
  return prev.size === next.size ? prev : next;
}

const DEFAULT_GAP_X = 100;
const DEFAULT_GAP_Y = 100;

const fixedStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
};
const { class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('watermark'));

const mergedStyle = computed(() => ({
  ...fixedStyle,
  ...contextStyle?.value,
  ...style,
}));

const [, token] = useToken();

const color = computed(() => font.color || token.value.colorFill);
const fontSize = computed(() => font.fontSize || token.value.fontSizeLG);
const fontWeight = computed(() => font.fontWeight || 'normal');
const fontStyle = computed(() => font.fontStyle || 'normal');
const fontFamily = computed(() => font.fontFamily || 'sans-serif');
const textAlign = computed(() => font.textAlign || 'center');

const gapX = computed(() => gap?.[0] || DEFAULT_GAP_X);
const gapY = computed(() => gap?.[1] || DEFAULT_GAP_Y);
const gapXCenter = computed(() => gapX.value / 2);
const gapYCenter = computed(() => gapY.value / 2);
const offsetLeft = computed(() => offset?.[0] ?? gapXCenter.value);
const offsetTop = computed(() => offset?.[1] ?? gapYCenter.value);

const markStyle = computed(() => {
  const mergedMarkStyle: CSSProperties = {
    zIndex,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    backgroundRepeat: 'repeat',
  };

  /** Calculate the style of the offset */
  let positionLeft = offsetLeft.value - gapXCenter.value;
  let positionTop = offsetTop.value - gapYCenter.value;
  if (positionLeft > 0) {
    mergedMarkStyle.left = `${positionLeft}px`;
    mergedMarkStyle.width = `calc(100% - ${positionLeft}px)`;
    positionLeft = 0;
  }
  if (positionTop > 0) {
    mergedMarkStyle.top = `${positionTop}px`;
    mergedMarkStyle.height = `calc(100% - ${positionTop}px)`;
    positionTop = 0;
  }
  mergedMarkStyle.backgroundPosition = `${positionLeft}px ${positionTop}px`;

  return mergedMarkStyle;
});

const container = ref<HTMLDivElement | null>();

// Used for nest case like Modal, Drawer
const subElements = ref(new Set<HTMLElement>());

// Nest elements should also support watermark
const targetElements = computed(() => {
  const list = container.value ? [container.value] : [];
  return [...list, ...Array.from(subElements.value)];
});

// ============================ Content =============================
/**
 * Get the width and height of the watermark. The default values are as follows
 * Image: [120, 64]; Content: It's calculated by content;
 */
const getMarkSize = (ctx: CanvasRenderingContext2D) => {
  let defaultWidth = 120;
  let defaultHeight = 64;
  if (!image && ctx.measureText) {
    ctx.font = `${Number(fontSize)}px ${fontFamily.value}`;
    const contents = toList(content);
    const sizes = contents.map((item) => {
      const metrics = ctx.measureText(item!);

      return [metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent];
    });
    defaultWidth = Math.ceil(Math.max(...sizes.map((size) => size[0])));
    defaultHeight = Math.ceil(Math.max(...sizes.map((size) => size[1]))) * contents.length + (contents.length - 1) * FontGap;
  }
  return [width ?? defaultWidth, height ?? defaultHeight] as const;
};

const getClips = useClips();

type ClipParams = Parameters<typeof getClips>;
const getClipsCache = useSingletonCache<ClipParams, ReturnType<typeof getClips>>();

const watermarkInfo = ref<[base64: string, contentWidth: number]>(null!);

// Generate new Watermark content
const renderWatermark = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const ratio = getPixelRatio();
    const [markWidth, markHeight] = getMarkSize(ctx);

    const drawCanvas = (drawContent?: NonNullable<WatermarkProps['content']> | HTMLImageElement) => {
      const params: ClipParams = [
        drawContent || '',
        rotate,
        ratio,
        markWidth,
        markHeight,
        {
          color: color.value,
          fontSize: fontSize.value,
          fontStyle: fontStyle.value,
          fontWeight: fontWeight.value,
          fontFamily: fontFamily.value,
          textAlign: textAlign.value,
        },
        gapX.value,
        gapY.value,
      ] as const;

      const [nextClips, clipWidth] = getClipsCache(params, () => getClips(...params));

      watermarkInfo.value = [nextClips, clipWidth];
    };

    if (image) {
      const img = new Image();
      img.onload = () => {
        drawCanvas(img);
      };
      img.onerror = () => {
        drawCanvas(content);
      };
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = image;
    } else {
      drawCanvas(content);
    }
  }
};

const syncWatermark = useRafDebounce(renderWatermark);

// ============================= Effect =============================
// Append watermark to the container
const [appendWatermark, removeWatermark, isWatermarkEle] = useWatermark(markStyle, onRemove);

watch(
  [watermarkInfo, targetElements],
  () => {
    if (watermarkInfo?.value) {
      targetElements.value.forEach((holder) => {
        appendWatermark(watermarkInfo.value[0], watermarkInfo.value[1], holder);
      });
    }
  },
  { immediate: true, deep: true },
);

// ============================ Observe =============================
const onMutate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    if (reRendering(mutation, isWatermarkEle)) {
      syncWatermark();
    } else if (mutation.target === container.value && mutation.attributeName === 'style') {
      // We've only force container not modify.
      // Not consider nest case.
      const keyStyles = Object.keys(fixedStyle);

      for (let i = 0; i < keyStyles.length; i += 1) {
        const key = keyStyles[i];
        const oriValue = (mergedStyle as any)[key];
        const currentValue = (container.value.style as any)[key];

        if (oriValue && oriValue !== currentValue) {
          (container.value.style as any)[key] = oriValue;
        }
      }
    }
  });
};

useMutateObserver(
  targetElements,
  computed(() => onMutate),
);

watch(
  [
    () => rotate,
    () => zIndex,
    () => width,
    () => height,
    () => image,
    () => content,
    color,
    fontSize,
    fontWeight,
    fontStyle,
    fontFamily,
    textAlign,
    gapX,
    gapY,
    offsetLeft,
    offsetTop,
  ],
  () => {
    syncWatermark();
  },
  { immediate: true },
);

// ============================ Context =============================
const watermarkContext = computed<WatermarkContextProps>(() => ({
  add: (ele) => {
    const clone = new Set(subElements.value);
    clone.add(ele);
    subElements.value = getSizeDiff(subElements.value, clone);
  },
  remove: (ele) => {
    removeWatermark(ele);
    const clone = new Set(subElements.value);
    clone.delete(ele);

    subElements.value = getSizeDiff(subElements.value, clone);
  },
}));
</script>
<template>
  <div ref="container" :class="clsx(className, contextClassName, rootClassName)" :style="mergedStyle">
    <WatermarkContextProvider v-if="inherit" :value="watermarkContext">
      <slot></slot>
    </WatermarkContextProvider>
    <slot v-else></slot>
  </div>
</template>
