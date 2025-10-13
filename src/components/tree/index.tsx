import type { BasicDataNode } from '@/vc-component/tree';
import type { DataNode } from '@/vc-component/tree/interface';
import DirectoryTree from './DirectoryTree.vue';
import TreePure from './Tree.vue';
export type { EventDataNode } from '@/vc-component/tree/interface';
export type { ExpandAction as DirectoryTreeExpandAction, DirectoryTreeProps } from './DirectoryTree.vue';
export type {
  AntdTreeNodeAttribute,
  AntTreeNode,
  AntTreeNodeCheckedEvent,
  AntTreeNodeExpandedEvent,
  AntTreeNodeMouseEvent,
  AntTreeNodeProps,
  AntTreeNodeSelectedEvent,
  TreeProps,
} from './Tree.vue';
export type { BasicDataNode, DataNode };

type CompoundedComponent = typeof TreePure & {
  DirectoryTree: typeof DirectoryTree;
};

const Tree = TreePure as CompoundedComponent;
Tree.DirectoryTree = DirectoryTree;

export default Tree;
