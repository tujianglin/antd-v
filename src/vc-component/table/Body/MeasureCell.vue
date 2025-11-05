<script setup lang="tsx">
import Render from '@/vc-component/render';
import ResizeObserver from '@/vc-component/resize-observer';
import type { VueKey, VueNode } from '@/vc-util/type';
import { onMounted, ref } from 'vue';

export interface MeasureCellProps {
  columnKey: VueKey;
  onColumnResize: (key: VueKey, width: number) => void;
  title?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { columnKey, onColumnResize, title } = defineProps<MeasureCellProps>();

const cellRef = ref<HTMLTableCellElement | null>(null);

onMounted(() => {
  if (cellRef.value) {
    onColumnResize?.(columnKey, cellRef.value.offsetWidth);
  }
});
</script>

<template>
  <ResizeObserver :data="columnKey">
    <td ref="cellRef" :style="{ paddingTop: 0, paddingBottom: 0, borderTop: 0, borderBottom: 0, height: 0 }">
      <div :style="{ height: 0, overflow: 'hidden', fontWeight: 'bold' }">
        <Render :content="title || '\xa0'" />
      </div>
    </td>
  </ResizeObserver>
</template>
