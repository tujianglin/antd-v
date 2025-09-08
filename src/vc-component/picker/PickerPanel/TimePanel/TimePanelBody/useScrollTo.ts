import isVisible from '@/vc-util/Dom/isVisible';
import raf from '@/vc-util/raf';
import { ref, type Ref } from 'vue';

const SPEED_PTG = 1 / 3;

export default function useScrollTo(
  ulRef: Ref<HTMLUListElement>,
  value: Ref<number | string>,
): [syncScroll: VoidFunction, clearScroll: VoidFunction, isScrolling: () => boolean] {
  // ========================= Scroll =========================
  const scrollingRef = ref<boolean>(false);
  const scrollRafRef = ref<number>(null);
  const scrollDistRef = ref<number>(null);

  const isScrolling = () => scrollingRef.value;

  const stopScroll = () => {
    raf.cancel(scrollRafRef.value);
    scrollingRef.value = false;
  };

  const scrollRafTimesRef = ref<number>();

  const startScroll = () => {
    const ul = ulRef.value;
    scrollDistRef.value = null;
    scrollRafTimesRef.value = 0;

    if (ul) {
      const targetLi = ul.querySelector<HTMLLIElement>(`[data-value="${value.value}"]`);
      const firstLi = ul.querySelector<HTMLLIElement>(`li`);

      const doScroll = () => {
        stopScroll();
        scrollingRef.value = true;
        scrollRafTimesRef.value += 1;

        const { scrollTop: currentTop } = ul;

        const firstLiTop = firstLi.offsetTop;
        const targetLiTop = targetLi.offsetTop;
        const targetTop = targetLiTop - firstLiTop;

        // Wait for element exist. 5 frames is enough
        if ((targetLiTop === 0 && targetLi !== firstLi) || !isVisible(ul)) {
          if (scrollRafTimesRef.value <= 5) {
            scrollRafRef.value = raf(doScroll);
          }
          return;
        }

        const nextTop = currentTop + (targetTop - currentTop) * SPEED_PTG;
        const dist = Math.abs(targetTop - nextTop);

        // Break if dist get larger, which means user is scrolling
        if (scrollDistRef.value !== null && scrollDistRef.value < dist) {
          stopScroll();
          return;
        }
        scrollDistRef.value = dist;

        // Stop when dist is less than 1
        if (dist <= 1) {
          ul.scrollTop = targetTop;
          stopScroll();
          return;
        }

        // IE not support `scrollTo`
        ul.scrollTop = nextTop;

        scrollRafRef.value = raf(doScroll);
      };

      if (targetLi && firstLi) {
        doScroll();
      }
    }
  };

  // ======================== Trigger =========================
  const syncScroll = startScroll;

  return [syncScroll, stopScroll, isScrolling];
}
