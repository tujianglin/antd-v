import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';
import { collectScroller, getWin } from '../util';

export default function useWatch(
  open: Ref<boolean>,
  target: Ref<HTMLElement>,
  popup: Ref<HTMLElement>,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  let win, mergedList;

  function notifyScroll() {
    onAlign();
    onScroll();
  }
  watch(
    [open, target, popup],
    async () => {
      await nextTick();
      if (open.value && target?.value && popup.value) {
        const targetElement = target.value;
        const popupElement = popup.value;
        const targetScrollList = collectScroller(targetElement);
        const popupScrollList = collectScroller(popupElement);
        win = getWin(popupElement);

        mergedList = new Set([win, ...targetScrollList, ...popupScrollList]);

        mergedList.forEach((scroller) => {
          scroller.addEventListener('scroll', notifyScroll, { passive: true });
        });

        win.addEventListener('resize', notifyScroll, { passive: true });

        // First time always do align
        onAlign();
      }
    },
    { flush: 'post', immediate: true, deep: true },
  );
  onBeforeUnmount(() => {
    mergedList?.forEach((scroller) => {
      scroller.removeEventListener('scroll', notifyScroll);
      win.removeEventListener('resize', notifyScroll);
    });
  });
}
