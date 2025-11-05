<script lang="tsx" setup>
import type { VueKey } from '@/vc-util/type';
import { computed, ref, toRefs, type CSSProperties, type TdHTMLAttributes } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type { FlattenData } from '../hooks/useFlattenRecords';
import useRowInfo from '../hooks/useRowInfo';
import { useStaticContextInject } from './context';
import { reactiveComputed } from '@vueuse/core';
import { computedExpandedClassName } from '../utils/expandUtil';
import clsx from 'clsx';
import Cell from '../Cell/index.vue';
import VirtualCell from './VirtualCell.vue';

export interface BodyLineProps<RecordType = any> {
  data: FlattenData<RecordType>;
  index: number;
  class?: string;
  style?: CSSProperties;
  rowKey: VueKey;

  /** Render cell only when it has `rowSpan > 1` */
  extra?: boolean;
  getHeight?: (rowSpan: number) => number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { data, index, class: className, rowKey, style, extra, getHeight, ...restProps } = defineProps<BodyLineProps>();
const { record, indent, index: renderIndex } = toRefs(reactiveComputed(() => data));

const { scrollX, flattenColumns, prefixCls, fixColumn, componentWidth } = toRefs(useTableContextInject());

const { getComponent } = toRefs(useStaticContextInject());

const rowInfo = useRowInfo(
  record,
  computed(() => rowKey),
  computed(() => index),
  indent,
);

const RowComponent = getComponent.value(['body', 'row'], 'div');
const cellComponent = getComponent.value(['body', 'cell'], 'div');

// ========================== Expand ==========================
const { rowSupportExpand, expanded, rowProps, expandedRowRender, expandedRowClassName } = toRefs(rowInfo);

const ExpandRowNode = () => {
  let expandRowNode;
  if (rowSupportExpand.value && expanded.value) {
    const expandContent = expandedRowRender?.value?.(record.value, index, indent.value + 1, expanded.value);

    const expandedClsName = computedExpandedClassName(expandedRowClassName.value, record.value, index, indent.value);

    let additionalProps: TdHTMLAttributes = {};
    if (fixColumn.value) {
      additionalProps = {
        style: {
          ['--virtual-width' as any]: `${componentWidth.value}px`,
        },
      };
    }

    const rowCellCls = `${prefixCls.value}-expanded-row-cell`;

    expandRowNode = (
      <RowComponent
        class={clsx(
          `${prefixCls.value}-expanded-row`,
          `${prefixCls.value}-expanded-row-level-${indent.value + 1}`,
          expandedClsName,
        )}
      >
        <Cell
          component={cellComponent}
          prefixCls={prefixCls.value}
          class={clsx(rowCellCls, { [`${rowCellCls}-fixed`]: fixColumn.value })}
          additionalProps={additionalProps}
        >
          {expandContent}
        </Cell>
      </RowComponent>
    );
  }
  return expandRowNode;
};

// ========================== Render ==========================
const rowStyle = computed<CSSProperties>(() => {
  const result: CSSProperties = {
    ...style,
    width: `${scrollX.value}px`,
  };
  if (extra) {
    result.position = 'absolute';
    result.pointerEvents = 'none';
  }
  return result;
});
const domRef = ref(null);

const RowNode = () => (
  <RowComponent
    {...rowProps.value}
    {...restProps}
    data-row-key={rowKey}
    ref={rowSupportExpand.value ? null : domRef}
    className={clsx(className, `${prefixCls.value}-row`, rowProps.value?.class, {
      [`${prefixCls.value}-row-extra`]: extra,
    })}
    style={{ ...rowStyle?.value, ...(rowProps.value as any)?.style }}
  >
    {flattenColumns.value.map((column, colIndex) => {
      return (
        <VirtualCell
          key={colIndex}
          component={cellComponent}
          rowInfo={rowInfo}
          column={column}
          colIndex={colIndex}
          indent={indent.value}
          index={index}
          renderIndex={renderIndex.value}
          record={record.value}
          inverse={extra}
          getHeight={getHeight}
        />
      );
    })}
  </RowComponent>
);
</script>
<template>
  <div v-if="rowSupportExpand" ref="domRef">
    <RowNode />
    <ExpandRowNode />
  </div>
  <RowNode v-else />
</template>
