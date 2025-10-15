import InternalCacader from './index.vue';
import CascaderPanel from './Panel.vue';

export type { CascaderAutoProps, CascaderProps } from './index.vue';
export type { CascaderPanelAutoProps, CascaderPanelProps } from './Panel.vue';

type CompoundedComponent = typeof InternalCacader & {
  Panel: typeof CascaderPanel;
};

const Cascader = InternalCacader as CompoundedComponent;

Cascader.Panel = CascaderPanel;

export default Cascader;
