<script lang="tsx" setup>
import { computed, toRefs } from 'vue';
import { useTableContextInject } from './context/TableContext';
import type { ColumnType } from './interface';
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil';

export interface ColGroupProps<RecordType> {
  colWidths: (number | string)[];
  columns?: ColumnType<RecordType>[];
  columCount?: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { colWidths, columns, columCount } = defineProps<ColGroupProps<any>>();

const { tableLayout } = toRefs(useTableContextInject());

const len = computed(() => columCount || columns.length);

const cols = computed(() => {
  const result = [];
  let mustInsert = false;
  for (let i = len.value - 1; i >= 0; i -= 1) {
    const width = colWidths[i];
    const column = columns && columns[i];
    let additionalProps: Record<string, unknown>;
    let minWidth: number;
    if (column) {
      additionalProps = column[INTERNAL_COL_DEFINE];

      // fixed will cause layout problems
      if (tableLayout.value === 'auto') {
        minWidth = column.minWidth;
      }
    }

    if (width || minWidth || additionalProps || mustInsert) {
      const { columnType: _, ...restAdditionalProps } = additionalProps || {};
      result.unshift(
        <col
          key={i}
          style={{ width: width ? `${width}px` : null, minWidth: minWidth ? `${minWidth}px` : null }}
          {...restAdditionalProps}
        ></col>,
      );
      mustInsert = true;
    }
  }
  return result;
});
</script>
<template>
  <colgroup v-if="cols.length > 0">
    <component :is="() => cols" />
  </colgroup>
</template>
