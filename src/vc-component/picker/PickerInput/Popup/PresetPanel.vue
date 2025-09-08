<script lang="tsx" setup generic="DateType extends object = any">
import { Render } from '@/components';
import {} from 'vue';
import type { ValueDate } from '../../interface';

export interface PresetPanelProps<ValueType = any> {
  prefixCls: string;
  presets: ValueDate<ValueType>[];
  onClick: (value: ValueType) => void;
  onHover: (value: ValueType) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, presets, onClick, onHover } = defineProps<PresetPanelProps<DateType>>();

function executeValue<ValueType extends object>(value: ValueDate<ValueType>['value']): ValueType {
  return typeof value === 'function' ? value() : value;
}
</script>
<template>
  <div v-if="presets?.length" :class="`${prefixCls}-presets`">
    <ul>
      <li
        v-for="({ label, value }, index) in presets"
        :key="index"
        @click="
          () => {
            onClick(executeValue(value));
          }
        "
        @mouseenter="
          () => {
            onHover(executeValue(value));
          }
        "
        @mouseleave="
          () => {
            onHover(null);
          }
        "
      >
        <Render :content="label" />
      </li>
    </ul>
  </div>
</template>
