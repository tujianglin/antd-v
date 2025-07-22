import Collection from './Collection.vue';
import RefResizeObserver from './index.vue';

export type { ResizeObserverProps } from './interface';

type CompoundedComponent = typeof RefResizeObserver & {
  Collection: typeof Collection;
};

const ResizeObserver = RefResizeObserver as CompoundedComponent;

ResizeObserver.Collection = Collection;

export default ResizeObserver;
