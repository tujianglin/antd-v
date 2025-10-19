import InternalImage from './index.vue';
import PreviewGroup from './PreviewGroup.vue';

type CompoundedComponent = typeof InternalImage & {
  PreviewGroup: typeof PreviewGroup;
};

export type { ImageProps } from './index.vue';

const Image = InternalImage as CompoundedComponent;
Image.PreviewGroup = PreviewGroup;

export default Image;
