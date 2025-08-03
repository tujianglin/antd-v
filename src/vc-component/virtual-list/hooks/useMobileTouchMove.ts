import { nextTick, onBeforeUnmount, shallowRef, watch, type Ref } from 'vue';

const SMOOTH_PTG = 14 / 15;

export default function useMobileTouchMove(
  inVirtual: Ref<boolean>,
  listRef: Ref<HTMLDivElement>,
  callback: (isHorizontal: boolean, offset: number, smoothOffset: boolean, e?: TouchEvent) => boolean,
) {
  const touchedRef = shallowRef(false);
  const touchXRef = shallowRef(0);
  const touchYRef = shallowRef(0);

  const elementRef = shallowRef<HTMLElement>(null);

  // Smooth scroll
  const intervalRef = shallowRef(null);

  let cleanUpEvents: () => void;

  const onTouchMove = (e: TouchEvent) => {
    if (touchedRef.value) {
      const currentX = Math.ceil(e.touches[0].pageX);
      const currentY = Math.ceil(e.touches[0].pageY);
      let offsetX = touchXRef.value - currentX;
      let offsetY = touchYRef.value - currentY;
      const isHorizontal = Math.abs(offsetX) > Math.abs(offsetY);
      if (isHorizontal) {
        touchXRef.value = currentX;
      } else {
        touchYRef.value = currentY;
      }

      const scrollHandled = callback(isHorizontal, isHorizontal ? offsetX : offsetY, false, e);
      if (scrollHandled) {
        e.preventDefault();
      }

      // Smooth interval
      clearInterval(intervalRef.value);

      if (scrollHandled) {
        intervalRef.value = setInterval(() => {
          if (isHorizontal) {
            offsetX *= SMOOTH_PTG;
          } else {
            offsetY *= SMOOTH_PTG;
          }
          const offset = Math.floor(isHorizontal ? offsetX : offsetY);
          if (!callback(isHorizontal, offset, true) || Math.abs(offset) <= 0.1) {
            clearInterval(intervalRef.value);
          }
        }, 16);
      }
    }
  };

  const onTouchEnd = () => {
    touchedRef.value = false;

    cleanUpEvents();
  };

  const onTouchStart = (e: TouchEvent) => {
    cleanUpEvents();

    if (e.touches.length === 1 && !touchedRef.value) {
      touchedRef.value = true;
      touchXRef.value = Math.ceil(e.touches[0].pageX);
      touchYRef.value = Math.ceil(e.touches[0].pageY);

      elementRef.value = e.target as HTMLElement;
      elementRef.value.addEventListener('touchmove', onTouchMove, { passive: false });
      elementRef.value.addEventListener('touchend', onTouchEnd, { passive: true });
    }
  };

  cleanUpEvents = () => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('touchmove', onTouchMove);
      elementRef.value.removeEventListener('touchend', onTouchEnd);
    }
  };

  watch(
    () => inVirtual.value,
    async () => {
      await nextTick();
      if (inVirtual.value) {
        listRef.value?.addEventListener('touchstart', onTouchStart, { passive: true });
      }
    },
    { flush: 'post', immediate: true },
  );

  onBeforeUnmount(() => {
    listRef.value?.removeEventListener('touchstart', onTouchStart);
    cleanUpEvents();
    clearInterval(intervalRef.value);
  });
}
