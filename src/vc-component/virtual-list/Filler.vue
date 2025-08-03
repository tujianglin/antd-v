<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties, type VNode } from 'vue';
import { Render } from '../../components';
import type { RenderNode } from '../../components/_util/type';
import { falseToUndefined } from '../../vc-util/props';
import ResizeObserver from '../resize-observer';
export type InnerProps = Pick<HTMLDivElement, 'role' | 'id'>;

interface FillerProps {
  prefixCls?: string;
  /** Virtual filler height. Should be `count * itemMinHeight` */
  height: number;
  /** Set offset of visible items. Should be the top of start item position */
  offsetY?: number;
  offsetX?: number;

  scrollWidth?: number;

  onInnerResize?: () => void;

  innerProps?: InnerProps;

  rtl: boolean;

  extra?: RenderNode;
}

defineOptions({ name: 'Filter', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { height, offsetY, offsetX, prefixCls, onInnerResize, innerProps, rtl, extra } = defineProps<FillerProps>();

const slots = defineSlots<{
  extra?: () => VNode[];
}>();

const extraSlot = computed(() => slots.extra || extra);

const { outerStyle, innerStyle } = toRefs(
  reactiveComputed(() => {
    let outer: CSSProperties = {};

    let inner: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
    };

    if (offsetY !== undefined) {
      // Not set `width` since this will break `sticky: right`
      outer = {
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
      };

      inner = {
        ...inner,
        transform: `translateY(${offsetY}px)`,
        [rtl ? 'marginRight' : 'marginLeft']: `${-offsetX}px`,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
      };
    }
    return { outerStyle: outer, innerStyle: inner };
  }),
);
const domRef = ref(null);

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <div :style="outerStyle">
    <ResizeObserver
      @resize="
        ({ offsetHeight }) => {
          if (offsetHeight && onInnerResize) {
            onInnerResize();
          }
        }
      "
    >
      <div
        :style="innerStyle"
        :class="
          clsx({
            [`${prefixCls}-holder-inner`]: prefixCls,
          })
        "
        ref="domRef"
        v-bind="{ ...innerProps, ...falseToUndefined($attrs) }"
      >
        <slot></slot>
        <Render :content="extraSlot" />
      </div>
    </ResizeObserver>
  </div>
</template>
