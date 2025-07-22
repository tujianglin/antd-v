import Compact from './Compact.vue';
import SpaceComp from './index.vue';

export type { SpaceProps } from './interface';

type CompoundedComponent = typeof SpaceComp & {
  Compact: typeof Compact;
};

const Space = SpaceComp as CompoundedComponent;
Space.Compact = Compact;

export default Space;
