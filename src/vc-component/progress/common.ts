import { ref, watchEffect, type Ref } from 'vue';
import type { ProgressProps } from './interface';

export const defaultProps: Partial<ProgressProps> = {
  percent: 0,
  prefixCls: 'rc-progress',
  strokeColor: '#2db7f5',
  strokeLinecap: 'round',
  strokeWidth: 1,
  railColor: '#D9D9D9',
  railWidth: 1,
  gapPosition: 'bottom',
  loading: false,
};

export const useTransitionDuration = (): Ref<SVGPathElement[]> => {
  const pathsRef = ref<SVGPathElement[]>([]);
  const prevTimeStamp = ref(null);

  watchEffect(() => {
    const now = Date.now();
    let updated = false;

    pathsRef.value.forEach((path) => {
      if (!path) {
        return;
      }

      updated = true;
      const pathStyle = path.style;
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s';

      if (prevTimeStamp.value && now - prevTimeStamp.value < 100) {
        pathStyle.transitionDuration = '0s, 0s';
      }
    });

    if (updated) {
      prevTimeStamp.value = Date.now();
    }
  });

  return pathsRef;
};
