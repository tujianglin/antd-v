import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import useForceUpdate from '../../_util/hooks/useForceUpdate';
import type { ScreenMap } from '../../_util/responsiveObserver';
import useResponsiveObserver from '../../_util/responsiveObserver';

function useBreakpoint(refreshOnChange: Ref<boolean>, defaultScreens: null): Ref<ScreenMap | null>;
function useBreakpoint(refreshOnChange?: Ref<boolean>, defaultScreens?: ScreenMap): Ref<ScreenMap>;

function useBreakpoint(refreshOnChange = ref(true), defaultScreens: ScreenMap | null = {} as ScreenMap): Ref<ScreenMap | null> {
  const screensRef = ref<ScreenMap | null>(defaultScreens);
  const forceUpdate = useForceUpdate();
  const responsiveObserver = useResponsiveObserver();
  let unsubscribe: (() => void) | null = null;
  onMounted(() => {
    const token = responsiveObserver.value.subscribe((supportScreens: ScreenMap) => {
      screensRef.value = supportScreens;
      if (refreshOnChange.value) {
        forceUpdate();
      }
    });

    unsubscribe = () => responsiveObserver.value.unsubscribe(token);
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  return screensRef;
}

export default useBreakpoint;
