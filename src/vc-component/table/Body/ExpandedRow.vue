<script lang="tsx" setup>
import Cell from '../Cell/index.vue';
import { useTableContextInject } from '../context/TableContext';
import type { CustomizeComponent } from '../interface';

export interface ExpandedRowProps {
  prefixCls: string;
  component: CustomizeComponent;
  cellComponent: CustomizeComponent;
  class: string;
  expanded: boolean;
  colspan: number;
  isEmpty: boolean;
  stickyOffset?: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  component: Component,
  cellComponent,
  class: className,
  expanded,
  colspan,
  isEmpty,
  stickyOffset = 0,
} = defineProps<ExpandedRowProps>();

const { scrollbarSize, fixHeader, fixColumn, componentWidth, horizonScroll } = useTableContextInject();
</script>
<template>
  <component :is="Component" :class="className" :style="{ display: expanded ? null : 'none' }">
    <Cell :component="cellComponent" :prefix-cls="prefixCls" :colspan="colspan">
      <div
        v-if="isEmpty ? horizonScroll && componentWidth : fixColumn"
        :style="{
          width: `${componentWidth - stickyOffset - (fixHeader && !isEmpty ? scrollbarSize : 0)}px`,
          position: 'sticky',
          left: `${stickyOffset}px`,
          overflow: 'hidden',
        }"
        :class="`${prefixCls}-expanded-row-fixed`"
      >
        <slot></slot>
      </div>
      <slot v-else></slot>
    </Cell>
  </component>
</template>
