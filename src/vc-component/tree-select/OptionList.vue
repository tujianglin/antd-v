<script lang="tsx" setup>
import { Render } from '@/components';
import { useBaseSelectContextInject } from '@/vc-component/select';
import Tree, { UnstableContextProvider, type TreeProps } from '@/vc-component/tree';
import type { EventDataNode } from '@/vc-component/tree/interface';
import KeyCode from '@/vc-util/KeyCode';
import type { VueKey } from '@/vc-util/type';
import { computed, ref, toRefs, useTemplateRef, watch } from 'vue';
import type { DataNode } from './interface';
import { useLegacySelectContextInject } from './LegacyContext';
import { useTreeSelectContextInject } from './TreeSelectContext';
import { getAllKeys, isCheckDisabled } from './utils/valueUtil';

interface TreeEventInfo {
  node: { key: VueKey };
  selected?: boolean;
  checked?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
};

const { prefixCls, multiple, searchValue, toggleOpen, open, notFoundContent } = toRefs(useBaseSelectContextInject());
const {
  virtual,
  listHeight,
  listItemHeight,
  listItemScrollOffset,
  treeData,
  fieldNames,
  onSelect,
  popupMatchSelectWidth,
  treeExpandAction,
  treeTitleRender,
  onPopupScroll,
  leftMaxCount,
  leafCountOnly,
  valueEntities,
  classNames: treeClassNames,
  styles,
} = toRefs(useTreeSelectContextInject());

const {
  checkable,
  checkedKeys,
  halfCheckedKeys,
  treeExpandedKeys,
  treeDefaultExpandAll,
  treeDefaultExpandedKeys,
  onTreeExpand,
  treeIcon,
  showTreeIcon,
  switcherIcon,
  treeLine,
  treeNodeFilterProp,
  loadData,
  treeLoadedKeys,
  treeMotion,
  onTreeLoad,
  keyEntities,
} = toRefs(useLegacySelectContextInject());

const treeRef = useTemplateRef('treeRef');

const memoTreeData = computed(() => treeData?.value as TreeProps['treeData']);

// ========================== Values ==========================
const mergedCheckedKeys = computed(() => {
  if (!checkable.value) {
    return null;
  }

  return {
    checked: checkedKeys.value,
    halfChecked: halfCheckedKeys.value,
  };
});

// ========================== Scroll ==========================
watch(
  open,
  () => {
    // Single mode should scroll to value key
    if (open.value && !multiple.value && checkedKeys.value.length) {
      treeRef.value?.scrollTo({ key: checkedKeys.value[0] });
    }
  },
  { immediate: true },
);

// ========================== Events ==========================
const onListMouseDown = (event) => {
  event.preventDefault();
};

const onInternalSelect: any = (__: VueKey[], info: TreeEventInfo) => {
  const { node } = info;

  if (checkable?.value && isCheckDisabled(node)) {
    return;
  }

  onSelect?.value?.(node.key, {
    selected: !checkedKeys?.value.includes(node.key),
  });

  if (!multiple?.value) {
    toggleOpen?.value?.(false);
  }
};

// =========================== Keys ===========================
const expandedKeys = ref<VueKey[]>(treeDefaultExpandedKeys?.value);
const searchExpandedKeys = ref<VueKey[]>(null);

const mergedExpandedKeys = computed(() => {
  if (treeExpandedKeys?.value) {
    return [...treeExpandedKeys.value];
  }
  return searchValue?.value ? searchExpandedKeys?.value : expandedKeys?.value;
});

const onInternalExpand = (keys: VueKey[]) => {
  expandedKeys.value = keys;
  searchExpandedKeys.value = keys;

  if (onTreeExpand?.value) {
    onTreeExpand?.value?.(keys);
  }
};

// ========================== Search ==========================
const lowerSearchValue = computed(() => String(searchValue.value).toLowerCase());
const filterTreeNode = (treeNode: EventDataNode<any>) => {
  if (!lowerSearchValue.value) {
    return false;
  }
  return String(treeNode[treeNodeFilterProp?.value]).toLowerCase().includes(lowerSearchValue.value);
};

watch(
  searchValue,
  () => {
    if (searchValue?.value) {
      searchExpandedKeys.value = getAllKeys(treeData?.value, fieldNames?.value);
    }
  },
  { immediate: true },
);

// ========================= Disabled =========================
// Cache disabled states in React state to ensure re-render when cache updates
const disabledCache = ref<Map<string, boolean>>(new Map());

watch(
  leftMaxCount,
  () => {
    if (leftMaxCount?.value) {
      disabledCache.value = new Map();
    }
  },
  { immediate: true },
);

function getDisabledWithCache(node: DataNode) {
  const value = node[fieldNames?.value?.value];
  if (!disabledCache.value.has(value)) {
    const entity = valueEntities.value.get(value);
    const isLeaf = (entity.children || []).length === 0;

    if (!isLeaf) {
      const checkableChildren = entity.children.filter(
        (childTreeNode) =>
          !childTreeNode.node.disabled &&
          !childTreeNode.node.disableCheckbox &&
          !checkedKeys?.value.includes(childTreeNode.node[fieldNames.value.value]),
      );

      const checkableChildrenCount = checkableChildren.length;
      disabledCache?.value?.set(value, checkableChildrenCount > leftMaxCount.value);
    } else {
      disabledCache?.value?.set(value, false);
    }
  }
  return disabledCache?.value?.get(value);
}

const nodeDisabled = (node: DataNode) => {
  const nodeValue = node[fieldNames?.value?.value];

  if (checkedKeys?.value?.includes(nodeValue)) {
    return false;
  }

  if (leftMaxCount?.value === null) {
    return false;
  }

  if (leftMaxCount?.value <= 0) {
    return true;
  }

  // This is a low performance calculation
  if (leafCountOnly?.value && leftMaxCount?.value) {
    return getDisabledWithCache(node);
  }

  return false;
};

// ========================== Get First Selectable Node ==========================
const getFirstMatchingNode = (nodes: EventDataNode<any>[]): EventDataNode<any> | null => {
  for (const node of nodes) {
    if (node.disabled || node.selectable === false) {
      continue;
    }

    if (searchValue?.value) {
      if (filterTreeNode(node)) {
        return node;
      }
    } else {
      return node;
    }

    if (node[fieldNames?.value?.children]) {
      const matchInChildren = getFirstMatchingNode(node[fieldNames?.value?.children]);
      if (matchInChildren) {
        return matchInChildren;
      }
    }
  }
  return null;
};

// ========================== Active ==========================
const activeKey = ref<VueKey>(null);
const activeEntity = computed(() => keyEntities?.value?.[activeKey.value]);

watch(
  [open, searchValue],
  () => {
    if (!open.value) {
      return;
    }
    let nextActiveKey = null;

    const getFirstNode = () => {
      const firstNode = getFirstMatchingNode(memoTreeData.value);
      return firstNode ? firstNode[fieldNames?.value?.value] : null;
    };

    // single mode active first checked node
    if (!multiple?.value && checkedKeys?.value?.length && !searchValue?.value) {
      nextActiveKey = checkedKeys?.value?.[0];
    } else {
      nextActiveKey = getFirstNode();
    }

    activeKey.value = nextActiveKey;
  },
  { immediate: true },
);

// ========================= Keyboard =========================
defineExpose({
  scrollTo: treeRef.value?.scrollTo,
  onKeydown: (event) => {
    const { which } = event;
    switch (which) {
      // >>> Arrow keys
      case KeyCode.UP:
      case KeyCode.DOWN:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        treeRef.value?.onKeydown(event);
        break;

      // >>> Select item
      case KeyCode.ENTER: {
        if (activeEntity.value) {
          const isNodeDisabled = nodeDisabled(activeEntity.value.node);
          const { selectable, value, disabled } = activeEntity.value?.node || {};
          if (selectable !== false && !disabled && !isNodeDisabled) {
            onInternalSelect(null, {
              node: { key: activeKey.value },
              selected: !checkedKeys?.value?.includes(value),
            });
          }
        }
        break;
      }

      // >>> Close
      case KeyCode.ESC: {
        toggleOpen?.value?.(false);
      }
    }
  },
  onKeyup: () => {},
});

const hasLoadDataFn = computed(() => !searchValue?.value);

const syncLoadData = computed(() => (hasLoadDataFn.value ? loadData?.value : null) as unknown as TreeProps['loadData']);

const treeProps = computed(() => {
  const result: Partial<TreeProps> = {
    fieldNames: fieldNames.value,
  };
  if (treeLoadedKeys.value) {
    result.loadedKeys = treeLoadedKeys.value;
  }
  if (mergedExpandedKeys.value) {
    result.expandedKeys = mergedExpandedKeys.value;
  }
  return result;
});
</script>
<template>
  <div v-if="memoTreeData.length === 0" role="listbox" :class="`${prefixCls}-empty`" @mousedown="onListMouseDown">
    <Render :content="notFoundContent" />
  </div>
  <div v-else @mousedown="onListMouseDown">
    <span v-if="activeEntity && open" :style="HIDDEN_STYLE" aria-live="assertive">
      <Render :content="activeEntity.node.value" />
    </span>
    <UnstableContextProvider :value="{ nodeDisabled }">
      <Tree
        ref="treeRef"
        :class-names="treeClassNames?.popup"
        :styles="styles?.popup"
        :focusable="false"
        :prefix-cls="`${prefixCls}-tree`"
        :tree-data="memoTreeData"
        :height="listHeight"
        :item-height="listItemHeight"
        :item-scroll-offset="listItemScrollOffset"
        :virtual="virtual !== false && popupMatchSelectWidth !== false"
        :multiple="multiple"
        :icon="treeIcon"
        :show-icon="showTreeIcon"
        :switcher-icon="switcherIcon"
        :show-line="treeLine"
        :load-data="syncLoadData"
        :motion="treeMotion"
        :active-key="activeKey"
        :checkable="checkable"
        check-strictly
        :checked-keys="mergedCheckedKeys"
        :selected-keys="!checkable ? checkedKeys : []"
        :default-expand-all="treeDefaultExpandAll"
        :title-render="treeTitleRender"
        v-bind="treeProps"
        @active-change="(e) => (activeKey = e)"
        @select="onInternalSelect"
        @check="onInternalSelect"
        @expand="onInternalExpand"
        @load="onTreeLoad"
        :filter-tree-node="filterTreeNode"
        :expand-action="treeExpandAction"
        @scroll="onPopupScroll"
      />
    </UnstableContextProvider>
  </div>
</template>
