import type { StatisticProps } from './Statistic.vue';
import Statistic from './Statistic.vue';
import type { StatisticTimerProps } from './Timer.vue';
import Timer from './Timer.vue';

export type { StatisticProps, StatisticTimerProps };

type CompoundedComponent = {
  Timer: typeof Timer;
};

export type CompoundedStatistic = typeof Statistic & CompoundedComponent;

(Statistic as CompoundedStatistic).Timer = Timer;

export default Statistic as CompoundedStatistic;
