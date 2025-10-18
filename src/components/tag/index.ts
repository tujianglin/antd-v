import CheckableTag from './CheckableTag.vue';
import CheckableTagGroup from './CheckableTagGroup.vue';
import InternalTag from './index.vue';

export type { TagProps } from './index.vue';

export type TagType = typeof InternalTag & {
  CheckableTag: typeof CheckableTag;
  CheckableTagGroup: typeof CheckableTagGroup;
};

const Tag = InternalTag as TagType;

Tag.CheckableTag = CheckableTag;
Tag.CheckableTagGroup = CheckableTagGroup;

export default Tag;
