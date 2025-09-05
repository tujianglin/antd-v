import { computed, type ComputedRef, type Ref } from 'vue';
import type { DataNode, SimpleModeConfig } from '../interface';

function buildTreeStructure(nodes: DataNode[], config: SimpleModeConfig): DataNode[] {
  const { id, pId, rootPId } = config;
  const nodeMap = new Map<string, DataNode>();
  const rootNodes: DataNode[] = [];

  nodes.forEach((node) => {
    const nodeKey = node[id as any];
    const clonedNode = { ...node, key: node.key || nodeKey };
    nodeMap.set(nodeKey, clonedNode);
  });

  nodeMap.forEach((node) => {
    const parentKey = node[pId as any];
    const parent = nodeMap.get(parentKey);

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else if (parentKey === rootPId || rootPId === null) {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

/**
 * 将 `treeData` 或 `children` 转换为格式化的 `treeData`。
 * 如果 `treeData` 或 `children` 没有变化，则不会重新计算。
 */
export default function useTreeData(
  treeData: Ref<DataNode[]>,
  simpleMode: Ref<boolean | SimpleModeConfig>,
): ComputedRef<DataNode[]> {
  return computed(() => {
    if (simpleMode.value) {
      const config: SimpleModeConfig = {
        id: 'id',
        pId: 'pId',
        rootPId: null,
        ...(typeof simpleMode.value === 'object' ? simpleMode.value : {}),
      };
      return buildTreeStructure(treeData.value, config);
    }
    return treeData.value;
  });
}
