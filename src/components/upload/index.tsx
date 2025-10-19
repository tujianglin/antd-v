import type { VueNode } from '@/vc-util/type';
import Dragger from './Dragger.vue';
import type { UploadProps } from './Upload.vue';
import InternalUpload from './Upload.vue';

export type { DraggerProps } from './Dragger.vue';
export type { RcFile, UploadChangeParam, UploadFile, UploadListProps, UploadProps } from './interface';

type InternalUploadType = typeof InternalUpload;
type CompoundedComponent = InternalUploadType & {
  (props: UploadProps): VueNode;
  Dragger: typeof Dragger;
  LIST_IGNORE: string;
};

const Upload = InternalUpload as CompoundedComponent;
Upload.Dragger = Dragger;

export default Upload;
