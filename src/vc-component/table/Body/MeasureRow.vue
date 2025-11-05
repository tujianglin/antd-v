<script lang="tsx" setup>
import type { VueKey } from '@/vc-util/type';
import { ref, toRefs } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type { ColumnType } from '../interface';
import ResizeObserver from '@/vc-component/resize-observer';
import isVisible from '@/vc-util/Dom/isVisible';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import MeasureCell from './MeasureCell.vue';

export interface MeasureRowProps {
  prefixCls: string;
  onColumnResize: (key: VueKey, width: number) => void;
  columnsKey: VueKey[];
  columns: ColumnType<any>[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, columnsKey, onColumnResize, columns } = defineProps<MeasureRowProps>();

const { measureRowRender } = toRefs(useTableContextInject());

const domRef = ref(null);

const MeasureRow = () => (
  <tr aria-hidden="true" class={`${prefixCls}-measure-row`} style={{ height: 0 }} ref={domRef}>
    <ResizeObserver.Collection
      onBatchResize={(infoList) => {
        if (isVisible(domRef.value)) {
          infoList.forEach(({ data: columnKey, size }) => {
            onColumnResize(columnKey, size.offsetWidth);
          });
        }
      }}
    >
      {columnsKey.map((columnKey) => {
        const column = columns.find((col) => col.key === columnKey);
        const rawTitle = column?.title;
        const titleForMeasure = isValidElement(rawTitle) ? cloneElement(rawTitle, { ref: null }) : rawTitle;
        return <MeasureCell key={columnKey} columnKey={columnKey} onColumnResize={onColumnResize} title={titleForMeasure} />;
      })}
    </ResizeObserver.Collection>
  </tr>
);
</script>
<template>
  <div></div>
  <component v-if="typeof measureRowRender === 'function'" :is="measureRowRender(MeasureRow())" />
  <MeasureRow v-else />
</template>
