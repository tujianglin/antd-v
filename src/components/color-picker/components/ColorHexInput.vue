<script lang="tsx" setup>
import { computed, ref, watch } from 'vue';
import Input from '../../input/Input.vue';
import type { AggregationColor } from '../color';
import { toHexFormat } from '../color';
import { generateColor } from '../util';

interface ColorHexInputProps {
  prefixCls: string;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

const { prefixCls, value, onChange } = defineProps<ColorHexInputProps>();

const hexReg = /(^#[\da-f]{6}$)|(^#[\da-f]{8}$)/i;
const isHexString = (hex?: string) => hexReg.test(`#${hex}`);

const colorHexInputPrefixCls = computed(() => `${prefixCls}-hex-input`);
const hexValue = ref(value ? toHexFormat(value.toHexString()) : undefined);

// Update step value
watch(
  () => value,
  () => {
    if (value) {
      hexValue.value = toHexFormat(value.toHexString());
    }
  },
  { immediate: true },
);

const handleHexChange = (e) => {
  const originValue = e.target.value;
  hexValue.value = toHexFormat(originValue);
  if (isHexString(toHexFormat(originValue, true))) {
    onChange?.(generateColor(originValue));
  }
};
</script>
<template>
  <Input :class="colorHexInputPrefixCls" :value="hexValue" prefix="#" @change="handleHexChange" size="small" />
</template>
