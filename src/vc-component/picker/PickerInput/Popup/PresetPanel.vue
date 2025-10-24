<script lang="tsx" setup generic="DateType extends object = any">
import Render from '@/vc-component/render';
import type { DateType } from '@/vc-util/type';
import type { ValueDate } from '../../interface';

export interface PresetPanelProps {
  prefixCls: string;
  presets: ValueDate[];
  onClick: (value: DateType) => void;
  onHover: (value: DateType) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, presets, onClick, onHover } = defineProps<PresetPanelProps>();

function executeValue(value: ValueDate['value']): any {
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
