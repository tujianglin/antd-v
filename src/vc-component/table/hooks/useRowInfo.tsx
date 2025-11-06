import type { VueKey } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { clsx } from 'clsx';
import { computed, toRefs, type Ref } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import { getColumnsKey } from '../utils/valueUtil';

export default function useRowInfo<RecordType>(
  record: Ref<RecordType>,
  rowKey: Ref<VueKey>,
  recordIndex: Ref<number>,
  indent: Ref<number>,
) {
  const context = useTableContextInject();
  const {
    flattenColumns,
    expandableType,
    expandedKeys,
    childrenColumnName,
    onTriggerExpand,
    rowExpandable,
    onRow,
    expandRowByClick,
    rowClassName,
  } = toRefs(context);

  // ======================= Expandable =======================
  // Only when row is not expandable and `children` exist in record
  const nestExpandable = computed(() => expandableType?.value === 'nest');

  const rowSupportExpand = computed(
    () => expandableType?.value === 'row' && (!rowExpandable?.value || rowExpandable?.value?.(record.value)),
  );
  const mergedExpandable = computed(() => rowSupportExpand?.value || nestExpandable?.value);

  const expanded = computed(() => expandedKeys.value && expandedKeys.value.has(rowKey.value));

  const hasNestChildren = computed(() => childrenColumnName?.value && record.value && record.value[childrenColumnName?.value]);

  // ========================= onRow ==========================
  const rowProps = computed(() => onRow.value?.(record.value, recordIndex.value));
  const onRowClick = computed(() => rowProps.value?.onClick);

  const onClick = (event) => {
    if (expandRowByClick.value && mergedExpandable.value) {
      onTriggerExpand?.value?.(record.value, event);
    }

    onRowClick?.value?.(event);
  };

  // ====================== RowClassName ======================
  const computeRowClassName = computed(() => {
    let result;
    if (typeof rowClassName.value === 'string') {
      result = rowClassName.value;
    } else if (typeof rowClassName.value === 'function') {
      result = rowClassName.value(record.value, recordIndex.value, indent.value);
    }
    return result;
  });

  // ========================= Column =========================
  const columnsKey = computed(() => getColumnsKey(flattenColumns.value));

  return reactiveComputed(
    () =>
      ({
        ...context,
        columnsKey: columnsKey.value,
        nestExpandable: nestExpandable.value,
        expanded: expanded.value,
        hasNestChildren: hasNestChildren.value,
        record: record.value,
        onTriggerExpand: onTriggerExpand.value,
        rowSupportExpand: rowSupportExpand.value,
        expandable: mergedExpandable.value,
        rowProps: {
          ...rowProps.value,
          class: clsx(computeRowClassName.value, rowProps?.value?.class),
          onClick,
        },
      }) as any,
  );
}
