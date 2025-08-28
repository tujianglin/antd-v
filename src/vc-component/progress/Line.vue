<script lang="tsx" setup>
import { computed, toRefs, useId, type CSSProperties } from 'vue';
import { useTransitionDuration } from './common';
import getIndeterminateLine from './utils/getIndeterminateLine';
import type { ProgressProps } from './interface';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { Render } from '@/components';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id: _,
  class: className,
  percent = 0,
  prefixCls = 'rc-progress',
  strokeColor = '#2db7f5',
  strokeLinecap = 'round',
  strokeWidth = 1,
  style,
  railColor = '#D9D9D9',
  railWidth = 1,
  transition = 'bottom',
  loading = false,
  ...restProps
} = defineProps<ProgressProps>();

const mergedId = useId();

const percentList = computed(() => (Array.isArray(percent) ? percent : [percent]));
const strokeColorList = computed(() => (Array.isArray(strokeColor) ? strokeColor : [strokeColor]));

const paths = useTransitionDuration();

const center = computed(() => strokeWidth / 2);
const right = computed(() => 100 - strokeWidth / 2);
const pathString = computed(
  () => `M ${strokeLinecap === 'round' ? center.value : 0},${center.value}
         L ${strokeLinecap === 'round' ? right.value : 100},${center.value}`,
);
const viewBoxString = computed(() => `0 0 100 ${strokeWidth}`);
let stackPtg = 0;
const { indeterminateStyleProps, indeterminateStyleAnimation } = toRefs(
  reactiveComputed(() => {
    return getIndeterminateLine({
      id: mergedId,
      loading,
      percent: percentList.value[0],
      strokeLinecap,
      strokeWidth,
    });
  }),
);

const ItemNode = () => {
  return (
    <>
      {percentList.value.map((ptg, index) => {
        let dashPercent = 1;
        switch (strokeLinecap) {
          case 'round':
            dashPercent = 1 - strokeWidth / 100;
            break;
          case 'square':
            dashPercent = 1 - strokeWidth / 2 / 100;
            break;
          default:
            dashPercent = 1;
            break;
        }
        const pathStyle: CSSProperties = {
          'stroke-dasharray': `${ptg * dashPercent}px, 100px`,
          'stroke-dashoffset': `-${stackPtg}px`,
          transition: transition || 'stroke-dashoffset 0.3s ease 0s, stroke-dasharray .3s ease 0s, stroke 0.3s linear',
          ...indeterminateStyleProps.value,
        };
        const color = strokeColorList.value[index] || strokeColorList.value[strokeColorList.value.length - 1];
        stackPtg += ptg;
        return (
          <path
            key={index}
            class={`${prefixCls}-line-path`}
            d={pathString.value}
            stroke-linecap={strokeLinecap}
            stroke={color as string}
            stroke-width={strokeWidth}
            fill-opacity="0"
            ref={(elem) => {
              // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
              // React will call the ref callback with the DOM element when the component mounts,
              // and call it with `null` when it unmounts.
              // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

              paths.value[index] = elem as SVGPathElement;
            }}
            style={pathStyle}
          />
        );
      })}
    </>
  );
};
</script>
<template>
  <svg
    :class="clsx(`${prefixCls}-line`, className)"
    :viewBox="viewBoxString"
    preserve-aspect-ratio="none"
    :style="style"
    v-bind="omit(restProps, ['gapPosition'])"
  >
    <path
      :class="`${prefixCls}-line-rail`"
      :d="pathString"
      :stroke-linecap="strokeLinecap"
      :stroke="railColor"
      :stroke-width="railWidth || strokeWidth"
      fill-opacity="0"
    />
    <Render :content="ItemNode" />
    <Render :content="indeterminateStyleAnimation" />
  </svg>
</template>
