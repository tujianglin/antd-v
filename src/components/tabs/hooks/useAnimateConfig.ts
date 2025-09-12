import type { CSSMotionProps } from '@/vc-component/motion';
import type { AnimatedConfig } from '@/vc-component/tabs/interface';
import { getTransitionName } from '../../_util/motion';
import type { TabsProps } from '../index.vue';

const motion: CSSMotionProps = {
  motionAppear: false,
  motionEnter: true,
  motionLeave: true,
};

export default function useAnimateConfig(
  prefixCls: string,
  animated: TabsProps['animated'] = {
    inkBar: true,
    tabPane: false,
  },
): AnimatedConfig {
  let mergedAnimated: AnimatedConfig;

  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false,
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true,
    };
  } else {
    mergedAnimated = {
      inkBar: true,
      ...(typeof animated === 'object' ? animated : {}),
    };
  }

  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = {
      ...motion,
      motionName: getTransitionName(prefixCls, 'switch'),
    };
  }

  return mergedAnimated;
}
