import InternalBadge from './Badge.vue';
import Ribbon from './Ribbon.vue';

export type { ScrollNumberProps } from './ScrollNumber.vue';

export type { BadgeProps } from './Badge.vue';

type CompoundedComponent = typeof InternalBadge & {
  Ribbon: typeof Ribbon;
};

const Badge = InternalBadge as CompoundedComponent;

Badge.Ribbon = Ribbon;

export default Badge;
