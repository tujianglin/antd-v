import { computed, toRefs, type Reactive, type Ref } from 'vue';
import type { TreeSelectProps } from '../TreeSelect.vue';
import type { DataNode, FieldNames } from '../interface';
import { fillLegacyProps } from '../utils/legacyUtil';

type FilterFn = Exclude<TreeSelectProps['showSearch'], boolean>['filterTreeNode'];
const useFilterTreeData = (
  treeData: Ref<DataNode[]>,
  searchValue: Ref<string>,
  options: Reactive<{
    fieldNames: FieldNames;
    treeNodeFilterProp: string;
    filterTreeNode: FilterFn;
  }>,
) => {
  const { fieldNames, treeNodeFilterProp, filterTreeNode } = toRefs(options);
  const fieldChildren = computed(() => fieldNames.value.children);

  return computed(() => {
    if (!searchValue.value || filterTreeNode.value === false) {
      return treeData.value;
    }

    const filterOptionFunc: FilterFn =
      typeof filterTreeNode.value === 'function'
        ? filterTreeNode.value
        : (_, dataNode) => String(dataNode[treeNodeFilterProp.value]).toUpperCase().includes(searchValue.value.toUpperCase());

    const filterTreeNodes = (nodes: DataNode[], keepAll = false): DataNode[] =>
      nodes.reduce<DataNode[]>((filtered, node) => {
        const children = node[fieldChildren.value];
        const isMatch = keepAll || filterOptionFunc(searchValue.value, fillLegacyProps(node));
        const filteredChildren = filterTreeNodes(children || [], isMatch);

        if (isMatch || filteredChildren.length) {
          filtered.push({
            ...node,
            isLeaf: undefined,
            [fieldChildren.value]: filteredChildren,
          });
        }
        return filtered;
      }, []);

    return filterTreeNodes(treeData.value);
  });
};

export default useFilterTreeData;
