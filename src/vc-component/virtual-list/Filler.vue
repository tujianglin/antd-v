<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { falseToUndefined } from '@/vc-util/props';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties, type VNode } from 'vue';
import ResizeObserver from '../resize-observer';
export type InnerProps = Pick<HTMLDivElement, 'role' | 'id'>;

interface FillerProps {
  prefixCls?: string;
  /** Virtual filler height. Should be `count * itemMinHeight` */
  height: number | undefined;
  /** Set offset of visible items. Should be the top of start item position */
  offsetY?: number;
  offsetX?: number;

  scrollWidth?: number;

  onInnerResize?: () => void;

  innerProps?: InnerProps;

  rtl: boolean;

  extra?: VueNode;
}

defineOptions({ name: 'Filler', inheritAttrs: false, compatConfig: { MODE: 3 } });

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
