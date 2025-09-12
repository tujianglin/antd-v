import InternalBadge from './index.vue';
import Ribbon from './Ribbon.vue';

export type { BadgeProps } from './index.vue';

type CompoundedComponent = typeof InternalBadge & {
  Ribbon: typeof Ribbon;
};

const Badge = InternalBadge as CompoundedComponent;

Badge.Ribbon = Ribbon;

export default Badge;
