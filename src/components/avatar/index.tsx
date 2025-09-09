import InternalAvatar from './Avatar.vue';
import AvatarGroup from './AvatarGroup.vue';

export type { AvatarProps } from './Avatar.vue';
export type { AvatarGroupProps } from './AvatarGroup.vue';

type CompoundedComponent = typeof InternalAvatar & {
  Group: typeof AvatarGroup;
};

const Avatar = InternalAvatar as CompoundedComponent;

Avatar.Group = AvatarGroup;

export default Avatar;
