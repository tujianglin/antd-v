/**
 * Webpack has bug for import loop, which is not the same behavior as ES module.
 * When util.js imports the TreeNode for tree generate will cause treeContextTypes be empty.
 */
import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { BasicDataNode, DataNode, Direction, EventDataNode, IconType, KeyEntities, TreeNodeProps } from './interface';
import type { DraggableConfig, SemanticName } from './Tree.vue';

export type NodeMouseEventParams<TreeDataType extends BasicDataNode = DataNode> = {
  event: MouseEvent;
  node: EventDataNode<TreeDataType>;
};
export type NodeDragEventParams<TreeDataType extends BasicDataNode = DataNode> = {
  event: DragEvent;
  node: EventDataNode<TreeDataType>;
};

export type NodeMouseEventHandler<TreeDataType extends BasicDataNode = DataNode> = (
  e: MouseEvent,
  node: EventDataNode<TreeDataType>,
) => void;
export type NodeDragEventHandler<TreeDataType extends BasicDataNode = DataNode> = (
  e: DragEvent,
  nodeProps: TreeNodeProps<TreeDataType>,
  outsideTree?: boolean,
) => void;

export interface TreeContextProps<TreeDataType extends BasicDataNode = DataNode> {
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  prefixCls: string;
  selectable: boolean;
  showIcon: boolean;
  icon: IconType;
  switcherIcon: IconType;
  draggable?: DraggableConfig;
  draggingNodeKey?: PropertyKey;
  checkable: boolean | any;
  checkStrictly: boolean;
  disabled: boolean;
  keyEntities: KeyEntities;
  // for details see comment in Tree.state (Tree.tsx)
  dropLevelOffset?: number;
  dropContainerKey: PropertyKey | null;
  dropTargetKey: PropertyKey | null;
  dropPosition: -1 | 0 | 1 | null;
  indent: number | null;
  dropIndicatorRender: (props: {
    dropPosition: -1 | 0 | 1;
    dropLevelOffset: number;
    indent: number;
    prefixCls: string;
    direction: Direction;
  }) => any;
  dragOverNodeKey: PropertyKey | null;
  direction: Direction;

  loadData: (treeNode: EventDataNode<TreeDataType>) => Promise<void>;
  filterTreeNode: (treeNode: EventDataNode<TreeDataType>) => boolean;
  titleRender?: (node: any) => any;

  onNodeClick: NodeMouseEventHandler<TreeDataType>;
  onNodeDoubleClick: NodeMouseEventHandler<TreeDataType>;
  onNodeExpand: NodeMouseEventHandler<TreeDataType>;
  onNodeSelect: NodeMouseEventHandler<TreeDataType>;
  onNodeCheck: (e: MouseEvent, treeNode: EventDataNode<TreeDataType>, checked: boolean) => void;
  onNodeLoad: (treeNode: EventDataNode<TreeDataType>) => void;
  onNodeMouseEnter: NodeMouseEventHandler<TreeDataType>;
  onNodeMouseLeave: NodeMouseEventHandler<TreeDataType>;
  onNodeContextMenu: NodeMouseEventHandler<TreeDataType>;
  onNodeDragStart: NodeDragEventHandler<any>;
  onNodeDragEnter: NodeDragEventHandler<any>;
  onNodeDragOver: NodeDragEventHandler<any>;
  onNodeDragLeave: NodeDragEventHandler<any>;
  onNodeDragEnd: NodeDragEventHandler<any>;
  onNodeDrop: NodeDragEventHandler<any>;
}

const TreeContext: InjectionKey<Reactive<TreeContextProps>> = Symbol('TreeContext');

export const useTreeContextInject = () => {
  return inject(TreeContext, reactive<Partial<TreeContextProps>>({}));
};

export const useTreeContextProvider = (props: Reactive<TreeContextProps>) => {
  provide(TreeContext, props);
};

export const TreeContextProvider = defineComponent({
  props: {
    value: Object as PropType<TreeContextProps>,
  },
  setup(props, { slots }) {
    useTreeContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

const UnstableContext: InjectionKey<{ nodeDisabled?: (n: DataNode) => boolean }> = Symbol('UnstableContext');

export const useUnstableContextInject = () => {
  return inject(UnstableContext, {});
};

export const useUnstableContextProvider = (props: { nodeDisabled?: (n: DataNode) => boolean }) => {
  provide(UnstableContext, props);
};

export const UnstableContextProvider = defineComponent({
  props: {
    value: Object as PropType<{ nodeDisabled?: (n: DataNode) => boolean }>,
  },
  setup(props, { slots }) {
    useUnstableContextProvider(props.value);
    return () => <>{slots?.default?.()}</>;
  },
});
