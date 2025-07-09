import Panel from './Panel.vue';
import SplitterComp from './Splitter.vue';
export type { SplitterProps } from './interface';

type CompoundedComponent = typeof SplitterComp & {
  Panel: typeof Panel;
};

const Splitter = SplitterComp as CompoundedComponent;
Splitter.Panel = Panel;

export default Splitter;
