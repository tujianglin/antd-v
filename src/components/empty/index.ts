import DefaultEmptyImg from './empty';
import InternalEmpty from './index.vue';
import SimpleEmptyImg from './simple';

export type { EmptyProps } from './index.vue';

type CompoundedComponent = typeof InternalEmpty & {
  PRESENTED_IMAGE_DEFAULT: typeof DefaultEmptyImg;
  PRESENTED_IMAGE_SIMPLE: typeof SimpleEmptyImg;
};

const Empty = InternalEmpty as CompoundedComponent;

Empty.PRESENTED_IMAGE_DEFAULT = DefaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = SimpleEmptyImg;

export { Empty };
