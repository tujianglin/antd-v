import InternalTabs from './index.vue';
import TabPane from './TabPane.vue';
export type { TabsProps } from './index.vue';

type CompoundedComponent = typeof InternalTabs & { TabPane: typeof TabPane };

const Tabs = InternalTabs as CompoundedComponent;
Tabs.TabPane = TabPane;

export default Tabs;
