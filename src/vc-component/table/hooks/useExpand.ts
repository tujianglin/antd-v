import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import { computed, ref, toRefs, type ComputedRef, type Ref } from 'vue';
import { INTERNAL_HOOKS } from '../constant';
import type { ExpandableConfig, ExpandableType, GetRowKey, Key, RenderExpandIcon, TriggerEventHandler } from '../interface';
import type { TableProps } from '../Table.vue';
import { findAllChildrenKeys, renderExpandIcon } from '../utils/expandUtil';
import { getExpandableProps } from '../utils/legacyUtil';

export default function useExpand<RecordType>(
  props: ReactiveComputedReturn<TableProps<RecordType>>,
  mergedData: ComputedRef<RecordType[]>,
  getRowKey: ComputedRef<GetRowKey<RecordType>>,
): [
  expandableConfig: ReactiveComputedReturn<ExpandableConfig<RecordType>>,
  expandableType: ComputedRef<ExpandableType>,
  expandedKeys: ComputedRef<Set<Key>>,
  expandIcon: ComputedRef<RenderExpandIcon<RecordType>>,
  childrenColumnName: Ref<string>,
  onTriggerExpand: TriggerEventHandler<RecordType>,
] {
  const expandableConfig = reactiveComputed(() => getExpandableProps(props));

  const {
    expandIcon,
    expandedRowKeys,
    defaultExpandedRowKeys,
    defaultExpandAllRows,
    expandedRowRender,
    onExpand,
    onExpandedRowsChange,
    childrenColumnName,
  } = toRefs(expandableConfig);

  const mergedExpandIcon = computed(() => expandIcon?.value || renderExpandIcon);
  const mergedChildrenColumnName = computed(() => childrenColumnName?.value || 'children');
  const expandableType = computed<ExpandableType>(() => {
    if (expandedRowRender?.value) {
      return 'row';
    }

    /**
     * Fix https://github.com/ant-design/ant-design/issues/21154
     * This is a workaround to not to break current behavior.
     * We can remove follow code after final release.
     *
     * To other developer:
     *  Do not use `__PARENT_RENDER_ICON__` in prod since we will remove this when refactor
     */
    if (
      (props.expandable && props.internalHooks === INTERNAL_HOOKS && (props.expandable as any).__PARENT_RENDER_ICON__) ||
      mergedData.value?.some((record) => record && typeof record === 'object' && record[mergedChildrenColumnName.value])
    ) {
      return 'nest';
    }

    return false;
  });

  const innerExpandedKeys = ref(
    defaultExpandedRowKeys?.value ||
      (defaultExpandAllRows?.value &&
        findAllChildrenKeys<RecordType>(mergedData.value, getRowKey.value, mergedChildrenColumnName.value)) ||
      [],
  );

  const mergedExpandedKeys = computed(() => new Set(expandedRowKeys?.value || innerExpandedKeys.value || []));

  const onTriggerExpand: TriggerEventHandler<RecordType> = (record: RecordType) => {
    const key = getRowKey.value(record, mergedData.value.indexOf(record));

    let newExpandedKeys: Key[];
    const hasKey = mergedExpandedKeys.value.has(key);
    if (hasKey) {
      mergedExpandedKeys.value.delete(key);
      newExpandedKeys = [...mergedExpandedKeys.value];
    } else {
      newExpandedKeys = [...mergedExpandedKeys.value, key];
    }

    innerExpandedKeys.value = newExpandedKeys;
    if (onExpand?.value) {
      onExpand?.value(!hasKey, record);
    }
    if (onExpandedRowsChange?.value) {
      onExpandedRowsChange?.value(newExpandedKeys);
    }
  };

  return [expandableConfig, expandableType, mergedExpandedKeys, mergedExpandIcon, mergedChildrenColumnName, onTriggerExpand];
}
