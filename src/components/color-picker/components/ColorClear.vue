<script lang="tsx" setup>
import {} from 'vue';
import type { AggregationColor } from '../color';
import { generateColor } from '../util';

interface ColorClearProps {
  prefixCls: string;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, value, onChange } = defineProps<ColorClearProps>();
const handleClick = () => {
  if (onChange && value && !value.cleared) {
    const hsba = value.toHsb();
    hsba.a = 0;
    const genColor = generateColor(hsba);
    genColor.cleared = true;

    onChange(genColor);
  }
};
</script>
<template>
  <div :class="`${prefixCls}-clear`" @click="handleClick"></div>
</template>
