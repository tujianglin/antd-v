<script lang="tsx" setup>
import { falseToUndefined } from '@/vc-util/props';
import clsx from 'clsx';
import { computed, ref, type CSSProperties } from 'vue';
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
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { height, offsetY, offsetX, prefixCls, onInnerResize, innerProps, rtl } = defineProps<FillerProps>();

const styles = computed(() => {
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
});
const domRef = ref(null);

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <div :style="styles.outerStyle">
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
        :style="styles.innerStyle"
        :class="
          clsx({
            [`${prefixCls}-holder-inner`]: prefixCls,
          })
        "
        ref="domRef"
        v-bind="{ ...innerProps, ...falseToUndefined($attrs) }"
      >
        <slot></slot>
        <slot name="extra"></slot>
      </div>
    </ResizeObserver>
  </div>
</template>
