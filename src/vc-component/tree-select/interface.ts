import type { DataNode as TreeDataNode } from '@/vc-component/tree/interface';
import type { VueKey } from '@/vc-util/type';

export type { VueKey };

export interface DataNode extends Record<string, any>, Omit<TreeDataNode, 'key' | 'children'> {
  key?: VueKey;
  value?: VueKey;
  children?: DataNode[];
}

export type SelectSource = 'option' | 'selection' | 'input' | 'clear';

export interface LabeledValueType {
  key?: VueKey;
  value?: VueKey;
  label?: any;
  /** Only works on `treeCheckStrictly` */
  halfChecked?: boolean;
}

export type DefaultValueType = VueKey | LabeledValueType | (VueKey | LabeledValueType)[];

export interface LegacyDataNode extends DataNode {
  props: any;
}

export interface FlattenDataNode {
  data: DataNode;
  key: VueKey;
  value: VueKey;
  level: number;
  parent?: FlattenDataNode;
}

export interface SimpleModeConfig {
  id?: VueKey;
  pId?: VueKey;
  rootPId?: VueKey;
}

export interface ChangeEventExtra {
  triggerValue: VueKey;
}

export interface FieldNames {
  value?: string;
  label?: string;
  children?: string;
  _title?: string[];
}
