import InternalImage from './Image.vue';
import PreviewGroup from './PreviewGroup.vue';

export * from './Image.vue';

type CompundedComponent = typeof InternalImage & {
  PreviewGroup: typeof PreviewGroup;
};

const Image = InternalImage as CompundedComponent;
Image.PreviewGroup = PreviewGroup;

export default Image;
