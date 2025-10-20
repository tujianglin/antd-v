<script lang="tsx" setup>
import type { FormatConfig, valueType } from './utils';

interface NumberProps extends FormatConfig {
  value: valueType;
  prefixCls?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { value, formatter, precision, decimalSeparator, groupSeparator = '', prefixCls } = defineProps<NumberProps>();

const ValueNode = () => {
  let valueNode;
  if (typeof formatter === 'function') {
    // Customize formatter
    valueNode = formatter(value);
  } else {
    // Internal formatter
    const val: string = String(value);
    const cells = val.match(/^(-?)(\d*)(\.(\d+))?$/);

    // Process if illegal number
    if (!cells || val === '-') {
      valueNode = val;
    } else {
      const negative = cells[1];
      let int = cells[2] || '0';
      let decimal = cells[4] || '';

      int = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

      if (typeof precision === 'number') {
        decimal = decimal.padEnd(precision, '0').slice(0, precision > 0 ? precision : 0);
      }

      if (decimal) {
        decimal = `${decimalSeparator}${decimal}`;
      }

      valueNode = [
        <span key="int" class={`${prefixCls}-content-value-int`}>
          {negative}
          {int}
        </span>,
        decimal && (
          <span key="decimal" class={`${prefixCls}-content-value-decimal`}>
            {decimal}
          </span>
        ),
      ];
    }
  }
  return valueNode;
};
</script>
<template>
  <span :class="`${prefixCls}-content-value`">
    <ValueNode />
  </span>
</template>
