import SkeletonAvatar from './Avatar.vue';
import SkeletonButton from './Button.vue';
import SkeletonImage from './Image.vue';
import SkeletonInput from './Input.vue';
import SkeletonNode from './Node.vue';
import InternalSkeleton from './Skeleton.vue';

export type { SkeletonProps } from './Skeleton.vue';

type CompoundedComponent = {
  Button: typeof SkeletonButton;
  Avatar: typeof SkeletonAvatar;
  Input: typeof SkeletonInput;
  Image: typeof SkeletonImage;
  Node: typeof SkeletonNode;
};

const Skeleton = InternalSkeleton as typeof InternalSkeleton & CompoundedComponent;
Skeleton.Button = SkeletonButton;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Input = SkeletonInput;
Skeleton.Image = SkeletonImage;
Skeleton.Node = SkeletonNode;

export default Skeleton;
