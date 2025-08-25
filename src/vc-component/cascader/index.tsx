import InternalCascader from './Cascader.vue';
import Panel from './Panel.vue';

export type { BaseOptionType, CascaderProps, CascaderRef, DefaultOptionType, FieldNames, SearchConfig } from './Cascader.vue';
export { Panel };

type CompundedComponent = typeof InternalCascader & {
  Panel: typeof Panel;
};

const Cascader = InternalCascader as CompundedComponent;
Cascader.Panel = Panel;

export default Cascader;
