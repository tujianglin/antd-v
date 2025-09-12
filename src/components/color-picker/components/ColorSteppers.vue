<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, ref } from 'vue';
import type { InputNumberProps } from '../../input-number';
import InputNumber from '../../input-number';

interface ColorSteppersProps {
  prefixCls: string;
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: any) => void;
  class?: string;
  prefix?: (prefixCls: string) => VueNode;
  formatter?: InputNumberProps['formatter'];
}

const { prefixCls, min = 0, max = 100, value, onChange, class: className, formatter } = defineProps<ColorSteppersProps>();

const colorSteppersPrefixCls = computed(() => `${prefixCls}-steppers`);
const internalValue = ref<any>(0);

const stepValue = computed(() => (!Number.isNaN(value) ? value : internalValue.value));
</script>
<template>
  <InputNumber
    :class="clsx(colorSteppersPrefixCls, className)"
    :min="min"
    :max="max"
    :value="stepValue"
    :formatter="formatter"
    size="small"
    @change="
      (step) => {
        internalValue = step || 0;
        onChange?.(step);
      }
    "
  />
</template>
