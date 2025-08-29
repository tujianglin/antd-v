<script lang="tsx" setup>
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import { useStepsContextInject } from './Context';
import { useStepIconSemanticContextInject } from './StepIconContext';

export type StepIconProps = {
  style?: CSSProperties;
  class?: string;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, style } = defineProps<StepIconProps>();

const { prefixCls, classNames, styles } = toRefs(useStepsContextInject());
const { class: itemClassName, style: itemStyle } = toRefs(useStepIconSemanticContextInject());

const itemCls = computed(() => `${prefixCls.value}-item`);

const domRef = ref();
</script>
<template>
  <div
    v-bind="pickAttrs($attrs, false)"
    ref="domRef"
    :class="clsx(`${itemCls}-icon`, classNames.itemIcon, itemClassName, className)"
    :style="{
      ...styles.itemIcon,
      ...itemStyle,
      ...style,
    }"
  >
    <slot></slot>
  </div>
</template>
