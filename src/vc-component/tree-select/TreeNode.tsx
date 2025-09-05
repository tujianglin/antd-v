/* istanbul ignore file */
import type { VueKey } from '@/vc-util/type';
import type { DataNode } from './interface';

export interface TreeNodeProps extends DataNode {
  value: VueKey;
}
