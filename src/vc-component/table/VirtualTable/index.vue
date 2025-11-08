<script lang="tsx" setup>
import getValue from '@/vc-util/utils/get';
import clsx from 'clsx';
import { computed, useTemplateRef } from 'vue';
import { INTERNAL_HOOKS } from '../constant';
import type { TableProps } from '../Table.vue';
import Table from '../Table.vue';
import { StaticContextProvider } from './context';
import { DEFAULT_PREFIX, type CustomizeScrollBody } from '../interface';
import Grid from './BodyGrid.vue';

export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'scroll'> {
  listItemHeight?: number;
  scroll: { x?: number; y?: number };
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  data,
  columns,
  scroll,
  sticky,
  prefixCls = DEFAULT_PREFIX,
  class: className,
  listItemHeight,
  components,
  onScroll,
  showHeader = true,
  rowHoverable = true,
} = defineProps<VirtualTableProps<any>>();

const scrollX = computed(() => {
  let result = scroll?.x;
  if (typeof result !== 'number') {
    result = 1;
  }
  return result;
});

const scrollY = computed(() => {
  let result = scroll?.y;
  if (typeof result !== 'number') {
    result = 500;
  }
  return result;
});

const getComponent = (path, defaultComponent) => getValue(components, path) || defaultComponent;

// ========================= Context ==========================
const context = computed(() => ({
  sticky,
  scrollY: scrollY.value,
  listItemHeight,
  getComponent,
  onScroll,
}));

const renderBody: CustomizeScrollBody<any> = (rawData, props) => {
  const { ref: domRef, onScroll } = props;
  return <Grid ref={domRef} data={rawData} onScroll={onScroll} />;
};

const tableRef = useTemplateRef('tableRef');

defineExpose({
  get nativeElement() {
    return tableRef.value?.nativeElement;
  },
  scrollTo: (config) => {
    tableRef.value?.scrollTo(config);
  },
});
</script>
<template>
  <StaticContextProvider :value="context">
    <Table
      v-bind="$props"
      :show-header="showHeader"
      :row-hoverable="rowHoverable"
      :class="clsx(className, `${prefixCls}-virtual`)"
      :scroll="{ ...scroll, x: scrollX }"
      :components="{
        ...components,
        body: data?.length ? renderBody : undefined,
      }"
      :columns="columns"
      :internal-hooks="INTERNAL_HOOKS"
      tailor
      ref="tableRef"
    />
  </StaticContextProvider>
</template>
