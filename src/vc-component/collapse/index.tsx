import InternalCollapse from './Collapse.vue';

import Panel from './Panel.vue';

export type { CollapsePanelProps, CollapseProps } from './interface';

type CompundedComponent = typeof InternalCollapse & {
  Panel: typeof Panel;
};

const Collapse = InternalCollapse as CompundedComponent;
Collapse.Panel = Panel;

export default Collapse;

export { Panel };
