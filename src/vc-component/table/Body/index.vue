<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, ref, toRefs } from 'vue';
import { PerfContextProvider, type PerfRecord } from '../context/PerfContext';
import { useTableContextInject } from '../context/TableContext';
import useFlattenRecords from '../hooks/useFlattenRecords';
import { getColumnsKey } from '../utils/valueUtil';
import BodyRow from './BodyRow.vue';
import ExpandedRow from './ExpandedRow.vue';
import MeasureRow from './MeasureRow.vue';

export interface BodyProps<RecordType = any> {
  data: RecordType[];
  measureColumnWidth: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { data, measureColumnWidth } = defineProps<BodyProps>();

const {
  prefixCls,
  getComponent,
  onColumnResize,
  flattenColumns,
  getRowKey,
  expandedKeys,
  childrenColumnName,
  emptyNode,
  classNames,
  styles,
  expandedRowOffset: ctxExpandedRowOffset,
  colWidths,
} = toRefs(useTableContextInject());

const expandedRowOffset = computed(() => ctxExpandedRowOffset.value || 0);

const bodyCls = computed(() => classNames?.value?.body || {});
const bodyStyles = computed(() => styles?.value?.body || {});

const flattenData = useFlattenRecords(
  computed(() => data),
  childrenColumnName,
  expandedKeys,
  getRowKey,
);

const rowKeys = computed(() => flattenData.value.map((item) => item.rowKey));

// =================== Performance ====================
const perfRef = ref<PerfRecord>({ renderWithProps: false });

// ===================== Expanded =====================
// `expandedRowOffset` data is same for all the rows.
// Let's calc on Body side to save performance.
const expandedRowInfo = computed(() => {
  const expandedColSpan = flattenColumns.value.length - expandedRowOffset.value;

  let expandedStickyStart = 0;
  for (let i = 0; i < expandedRowOffset.value; i += 1) {
    expandedStickyStart += colWidths.value[i] || 0;
  }

  return {
    offset: expandedRowOffset.value,
    colspan: expandedColSpan,
    sticky: expandedStickyStart,
  };
});

// ====================== Render ======================
const WrapperComponent = getComponent.value(['body', 'wrapper'], 'tbody');
const trComponent = getComponent.value(['body', 'row'], 'tr');
const tdComponent = getComponent.value(['body', 'cell'], 'td');
const thComponent = getComponent.value(['body', 'cell'], 'th');
</script>
<template>
  <PerfContextProvider :value="perfRef">
    <component :is="WrapperComponent" :style="bodyStyles.wrapper" :class="clsx(`${prefixCls}-tbody`, bodyCls.wrapper)">
      <MeasureRow
        v-if="measureColumnWidth"
        :prefix-cls="prefixCls"
        :columns-key="getColumnsKey(flattenColumns)"
        @column-resize="onColumnResize"
        :columns="flattenColumns"
      />
      <template v-if="data.length">
        <BodyRow
          v-for="(item, idx) in flattenData"
          :class-names="bodyCls"
          :styles="bodyStyles"
          :key="item.rowKey"
          :row-key="item.rowKey"
          :row-keys="rowKeys"
          :record="item.record"
          :index="idx"
          :render-index="item.index"
          :row-component="trComponent"
          :cell-component="tdComponent"
          :scope-cell-component="thComponent"
          :indent="item.indent"
          :expanded-row-info="expandedRowInfo"
        />
      </template>
      <ExpandedRow
        v-else
        expanded
        :class="`${prefixCls}-placeholder`"
        :prefix-cls="prefixCls"
        :component="trComponent"
        :cell-component="tdComponent"
        :colspan="flattenColumns.length"
        is-empty
      >
        <Render :content="emptyNode" />
      </ExpandedRow>
    </component>
  </PerfContextProvider>
</template>
