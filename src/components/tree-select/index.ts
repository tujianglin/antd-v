import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from '@/vc-component/tree-select';
import InternalTreeSelect from './index.vue';

export type { TreeSelectProps } from './index.vue';

type CompoundedComponent = typeof InternalTreeSelect & {
  SHOW_ALL: typeof SHOW_ALL;
  SHOW_PARENT: typeof SHOW_PARENT;
  SHOW_CHILD: typeof SHOW_CHILD;
};

const TreeSelect = InternalTreeSelect as CompoundedComponent;

TreeSelect.SHOW_ALL = SHOW_ALL;
TreeSelect.SHOW_PARENT = SHOW_PARENT;
TreeSelect.SHOW_CHILD = SHOW_CHILD;

export default TreeSelect;
