import type { VueKey } from '@/vc-util/type';
import type { CSSProperties } from 'vue';

export const MOTION_KEY = `RC_TREE_MOTION_${Math.random()}`;

const MotionNode: DataNode = {
  key: MOTION_KEY,
};

export const MotionEntity: DataEntity = {
  key: MOTION_KEY,
  level: 0,
  index: 0,
  pos: '0',
  node: MotionNode,
  nodes: [MotionNode],
};

export interface TreeNodeProps<TreeDataType extends BasicDataNode = DataNode> {
  eventKey?: VueKey; // Pass by parent `cloneElement`
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  id?: string | number;

  // By parent
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  loaded?: boolean;
  loading?: boolean;
  halfChecked?: boolean;
  title?: any;
  dragOver?: boolean;
  dragOverGapTop?: boolean;
  dragOverGapBottom?: boolean;
  pos?: string;
  domRef?: any;
  /** New added in Tree for easy data access */
  data?: TreeDataType;
  isStart?: boolean[];
  isEnd?: boolean[];
  active?: boolean;
  onMousemove?: (e: MouseEvent) => void;

  // By user
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  switcherIcon?: IconType;
}

/** For fieldNames, we provides a abstract interface */
export interface BasicDataNode {
  checkable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  isLeaf?: boolean;
  selectable?: boolean;
  switcherIcon?: IconType;

  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  class?: string;
  style?: CSSProperties;
}

/** Provide a wrap type define for developer to wrap with customize fieldNames data type */
export type FieldDataNode<T, ChildFieldName extends string = 'children'> = BasicDataNode &
  T &
  Partial<Record<ChildFieldName, FieldDataNode<T, ChildFieldName>[]>>;

/**
 * Typescript not support `bigint` as index type yet.
 * We use this to mark the `bigint` type is for `Key` usage.
 * It's safe to remove this when typescript fix:
 * https://github.com/microsoft/TypeScript/issues/50217
 */

export type KeyEntities<DateType extends BasicDataNode = any> = Record<VueKey, DataEntity<DateType>>;

export type DataNode = FieldDataNode<{
  key: VueKey;
  title?: any | ((data: DataNode) => any);
}>;

export type EventDataNode<TreeDataType> = {
  key: VueKey;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  loaded: boolean;
  loading: boolean;
  halfChecked: boolean;
  dragOver: boolean;
  dragOverGapTop: boolean;
  dragOverGapBottom: boolean;
  pos: string;
  active: boolean;
} & TreeDataType &
  BasicDataNode;

export type IconType = any | ((props: TreeNodeProps) => any);

export type NodeElement = TreeNodeProps & {
  selectHandle?: HTMLSpanElement;
  type: {
    isTreeNode: boolean;
  };
};

export type NodeInstance<TreeDataType extends BasicDataNode = DataNode> = TreeNodeProps<TreeDataType> & {
  selectHandle?: HTMLSpanElement;
};

export interface Entity {
  node: NodeElement;
  index: number;
  key: VueKey;
  pos: string;
  parent?: Entity;
  children?: Entity[];
}

export interface DataEntity<TreeDataType extends BasicDataNode = DataNode> extends Omit<Entity, 'node' | 'parent' | 'children'> {
  node: TreeDataType;
  nodes: TreeDataType[];
  parent?: DataEntity<TreeDataType>;
  children?: DataEntity<TreeDataType>[];
  level: number;
}

export interface FlattenNode<TreeDataType extends BasicDataNode = DataNode> {
  parent: FlattenNode<TreeDataType> | null;
  children: FlattenNode<TreeDataType>[];
  pos: string;
  data: TreeDataType;
  title: any;
  key: VueKey;
  isStart: boolean[];
  isEnd: boolean[];
}

export type GetKey<RecordType> = (record: RecordType, index?: number) => VueKey;

export type GetCheckDisabled<RecordType> = (record: RecordType) => boolean;

export type Direction = 'ltr' | 'rtl' | undefined;

export interface FieldNames {
  title?: string;
  /** @private Internal usage for `rc-tree-select`, safe to remove if no need */
  _title?: string[];
  key?: string;
  children?: string;
}
