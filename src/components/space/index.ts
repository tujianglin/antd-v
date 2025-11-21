import Addon from './Addon.vue';
import Compact from './Compact.vue';
import SpaceComp from './index.vue';

export type { SpaceProps } from './interface';

type CompoundedComponent = typeof SpaceComp & {
  Compact: typeof Compact;
  Addon: typeof Addon;
};

const Space = SpaceComp as CompoundedComponent;
Space.Compact = Compact;
Space.Addon = Addon;

export default Space;
