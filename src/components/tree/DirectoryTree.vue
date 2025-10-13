<script lang="tsx" setup>
import { computed, ref, toRefs, useTemplateRef } from 'vue';
import type { BasicDataNode } from '@/vc-component/tree';
import type { DataNode, EventDataNode } from '@/vc-component/tree/interface';
import { conductExpandParent } from '@/vc-component/tree/util';
import { convertDataToEntities } from '@/vc-component/tree/utils/treeUtil';
import type { AntdTreeNodeAttribute, TreeProps } from './Tree.vue';
import Tree from './Tree.vue';
import { calcRangeKeys, convertDirectoryKeysToNodes } from './utils/dictUtil';
import type { VueKey } from '@/vc-util/type';
import { FileOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons-vue';
import { useConfigContextInject } from '../config-provider';
import clsx from 'clsx';
import { omit } from 'lodash-es';

export type ExpandAction = false | 'click' | 'doubleClick';

export interface DirectoryTreeProps<T extends BasicDataNode = DataNode> extends TreeProps<T> {
  expandAction?: ExpandAction;
}

defineOptions({ name: 'DirectoryTree', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  defaultExpandAll,
  defaultExpandParent,
  prefixCls: customizePrefixCls,
  class: className,
  showIcon = true,
  expandAction = 'click',
  selectable = true,
  ...restProps
} = defineProps<DirectoryTreeProps>();

const expandedKeys = defineModel<VueKey[]>('expandedKeys', {
  get: (v) => {
    if (v?.length) return v;
    else return getInitExpandedKeys();
  },
});
const checkedKeys = defineModel<VueKey[] | { checked: VueKey[]; halfChecked: VueKey[] }>('checkedKeys');
const selectedKeys = defineModel<VueKey[]>('selectedKeys');

function getIcon(props: AntdTreeNodeAttribute) {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <FileOutlined />;
  }
  return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
}

function getTreeData({ treeData }: DirectoryTreeProps) {
  return treeData;
}

// Shift click usage
const lastSelectedKey = ref<VueKey>(null);

const cachedSelectedKeys = ref<VueKey[]>(null);

function getInitExpandedKeys() {
  const { keyEntities } = convertDataToEntities(getTreeData(restProps));

  let initExpandedKeys: VueKey[];

  // Expanded keys
  if (defaultExpandAll) {
    initExpandedKeys = Object.keys(keyEntities);
  } else if (defaultExpandParent) {
    initExpandedKeys = conductExpandParent(expandedKeys.value || [], keyEntities);
  } else {
    initExpandedKeys = expandedKeys.value || [];
  }
  return initExpandedKeys;
}
const onExpand = (
  keys: VueKey[],
  info: {
    node: EventDataNode<any>;
    expanded: boolean;
    nativeEvent: MouseEvent;
  },
) => {
  expandedKeys.value = keys;
  // Call origin function
  return restProps.onExpand?.(keys, info);
};

const onSelect = (
  keys: VueKey[],
  event: {
    event: 'select';
    selected: boolean;
    node: any;
    selectedNodes: DataNode[];
    nativeEvent: MouseEvent;
  },
) => {
  const { multiple, fieldNames } = restProps;
  const { node, nativeEvent } = event;
  const { key = '' } = node;

  const treeData = getTreeData(restProps);

  // We need wrap this event since some value is not same
  const newEvent = {
    ...event,
    selected: true, // Directory selected always true
  };

  // Windows / Mac single pick
  const ctrlPick: boolean = nativeEvent?.ctrlKey || nativeEvent?.metaKey;
  const shiftPick: boolean = nativeEvent?.shiftKey;

  // Generate new selected keys
  let newSelectedKeys: VueKey[];
  if (multiple && ctrlPick) {
    // Control click
    newSelectedKeys = keys;
    lastSelectedKey.value = key;
    cachedSelectedKeys.value = newSelectedKeys;
    newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
  } else if (multiple && shiftPick) {
    // Shift click
    newSelectedKeys = Array.from(
      new Set([
        ...(cachedSelectedKeys.value || []),
        ...calcRangeKeys({
          treeData,
          expandedKeys: expandedKeys.value,
          startKey: key,
          endKey: lastSelectedKey.value!,
          fieldNames,
        }),
      ]),
    );
    newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
  } else {
    // Single click
    newSelectedKeys = [key];
    lastSelectedKey.value = key;
    cachedSelectedKeys.value = newSelectedKeys;
    newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
  }

  selectedKeys.value = newSelectedKeys;
  restProps.onSelect?.(newSelectedKeys, newEvent);
};
const { getPrefixCls, direction } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('tree', customizePrefixCls));
const connectClassName = computed(() =>
  clsx(
    `${prefixCls.value}-directory`,
    {
      [`${prefixCls.value}-directory-rtl`]: direction?.value === 'rtl',
    },
    className,
  ),
);

const domRef = useTemplateRef('domRef');

defineExpose({
  ...domRef.value,
});
</script>
<template>
  <Tree
    ref="domRef"
    v-bind="omit(restProps, ['onSelect', 'onExpand'])"
    v-model:selected-keys="selectedKeys"
    v-model:expanded-keys="expandedKeys"
    v-model:checked-keys="checkedKeys"
    :selectable="selectable"
    :icon="getIcon"
    block-node
    :show-icon="showIcon"
    :expand-action="expandAction"
    :prefix-cls="prefixCls"
    :class="connectClassName"
    @select="onSelect"
    @expand="onExpand"
  />
</template>
