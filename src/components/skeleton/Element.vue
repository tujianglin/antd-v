<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';

export type ElementSemanticName = 'root' | 'content';

export interface SkeletonElementProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  size?: 'large' | 'small' | 'default' | number;
  shape?: 'circle' | 'square' | 'round' | 'default';
  active?: boolean;
  classNames?: Record<ElementSemanticName, string>;
  styles?: Record<ElementSemanticName, CSSProperties>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, style, size, shape } = defineProps<SkeletonElementProps>();

const sizeCls = computed(() =>
  clsx({
    [`${prefixCls}-lg`]: size === 'large',
    [`${prefixCls}-sm`]: size === 'small',
  }),
);

const shapeCls = computed(() =>
  clsx({
    [`${prefixCls}-circle`]: shape === 'circle',
    [`${prefixCls}-square`]: shape === 'square',
    [`${prefixCls}-round`]: shape === 'round',
  }),
);

const sizeStyle = computed<CSSProperties>(() =>
  typeof size === 'number'
    ? {
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
      }
    : {},
);
</script>
<template>
  <span :class="clsx(prefixCls, sizeCls, shapeCls, className)" :style="{ ...sizeStyle, ...style }"></span>
</template>
