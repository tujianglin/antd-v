<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import clsx from 'clsx';
import { computed, useId, type CSSProperties } from 'vue';
import type { PosInfo } from './hooks/useTarget';
import type { SemanticName, TourProps } from './interface';

export interface MaskProps {
  prefixCls?: string;
  pos: PosInfo | null; //	获取引导卡片指向的元素
  rootClassName?: string;
  showMask?: boolean;
  style?: CSSProperties;
  // to fill mask color, e.g. rgba(80,0,0,0.5)
  fill?: string;
  open?: boolean;
  animated?: boolean | { placeholder: boolean };
  zIndex?: number;
  disabledInteraction?: boolean;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  getPopupContainer?: TourProps['getPopupContainer'] | false;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  rootClassName,
  pos,
  showMask,
  style = {},
  fill = 'rgba(0,0,0,0.5)',
  open,
  animated,
  zIndex,
  disabledInteraction,
  styles,
  classNames: tourClassNames,
  getPopupContainer,
} = defineProps<MaskProps>();

const COVER_PROPS = {
  fill: 'transparent',
  pointerEvents: 'auto',
};

const id = useId();
const maskId = computed(() => `${prefixCls}-mask-${id}`);
const mergedAnimated = computed(() => (typeof animated === 'object' ? animated?.placeholder : animated));

const isSafari = computed(() => typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
const maskRectSize = computed(() => (isSafari.value ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }));

const inlineMode = computed(() => getPopupContainer === false);
</script>
<template>
  <Portal :open="open" :auto-lock="!inlineMode" :get-container="getPopupContainer">
    <div
      :class="clsx(`${prefixCls}-mask`, rootClassName, tourClassNames?.mask)"
      :style="{
        position: inlineMode ? 'absolute' : 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex,
        pointerEvents: pos && !disabledInteraction ? 'none' : 'auto',
        ...style,
        ...styles?.mask,
      }"
    >
      <svg v-if="showMask" :style="{ width: '100%', height: '100%' }">
        <defs>
          <mask :id="maskId">
            <rect x="0" y="0" v-bind="maskRectSize" fill="white" />
            <rect
              v-if="pos"
              :x="pos.left"
              :y="pos.top"
              :rx="pos.radius"
              :width="pos.width"
              :height="pos.height"
              fill="black"
              :class="mergedAnimated ? `${prefixCls}-placeholder-animated` : ''"
            />
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" :fill="fill" :mask="`url(#${maskId})`" />
        <template v-if="pos">
          <rect v-bind="COVER_PROPS" x="0" y="0" width="100%" :height="Math.max(pos.top, 0)" />
          <rect v-bind="COVER_PROPS" x="0" y="0" :width="Math.max(pos.left)" height="100%" />
          <rect
            v-bind="COVER_PROPS"
            x="0"
            :y="pos.top + pos.height"
            width="100%"
            :height="`calc(100% - ${pos.top + pos.height}px)`"
          />
          <rect
            v-bind="COVER_PROPS"
            :x="pos.left + pos.width"
            y="0"
            :width="`calc(100% - ${pos.left + pos.width}px)`"
            height="100%"
          />
        </template>
      </svg>
    </div>
  </Portal>
</template>
