import type { CSSMotionProps } from '@/vc-component/motion';

const motion: CSSMotionProps = {
  motionName: 'rc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  onLeaveStart: (ele) => {
    const { offsetHeight } = ele;
    return { height: `${offsetHeight}px` };
  },
  onLeaveActive: () => ({ height: 0, opacity: 0, margin: 0 }),
};

export default motion;
