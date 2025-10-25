<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, defineComponent, ref, watch, type CSSProperties } from 'vue';

export interface ProgressProps {
  prefixCls: string;
  percent: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { percent, prefixCls } = defineProps<ProgressProps>();

const viewSize = 100;
const borderWidth = viewSize / 5;
const radius = viewSize / 2 - borderWidth / 2;
const circumference = radius * 2 * Math.PI;
const position = 50;
// ✅ 定义成响应式组件
const CustomCircle = defineComponent({
  name: 'CustomCircle',
  props: {
    dotClassName: String,
    style: Object as () => CSSProperties,
    hasCircleCls: Boolean,
  },
  setup(props) {
    return () => (
      <circle
        class={clsx(`${props.dotClassName}-circle`, {
          [`${props.dotClassName}-circle-bg`]: props.hasCircleCls,
        })}
        r={radius}
        cx={position}
        cy={position}
        stroke-width={borderWidth}
        style={props.style}
      />
    );
  },
});

const dotClassName = computed(() => `${prefixCls}-dot`);
const holderClassName = computed(() => `${dotClassName.value}-holder`);
const hideClassName = computed(() => `${holderClassName.value}-hidden`);

const render = ref(false);

// ==================== Visible =====================
watch(
  () => percent !== 0,
  () => {
    if (percent !== 0) {
      render.value = true;
    }
  },
  { immediate: true, flush: 'post' },
);

// ==================== Progress ====================
const safePtg = computed(() => Math.max(Math.min(percent, 100), 0));

const circleStyle = computed<CSSProperties>(() => {
  return {
    strokeDashoffset: `${circumference / 4}`,
    strokeDasharray: `${(circumference * safePtg.value) / 100} ${(circumference * (100 - safePtg.value)) / 100}`,
  };
});
</script>
<template>
  <template v-if="!render"></template>
  <span v-else :class="clsx(holderClassName, `${dotClassName}-progress`, safePtg <= 0 && hideClassName)">
    <svg
      :viewBox="`0 0 ${viewSize} ${viewSize}`"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="safePtg"
    >
      <CustomCircle :dot-class-name="dotClassName" has-circle-cls />
      <CustomCircle :dot-class-name="dotClassName" :style="circleStyle" />
    </svg>
  </span>
</template>
