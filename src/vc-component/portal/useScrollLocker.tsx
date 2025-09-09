import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { removeCSS, updateCSS } from '../../vc-util/Dom/dynamicCSS';
import { getTargetScrollBarSize } from '../../vc-util/getScrollBarSize';
import { isBodyOverflowing } from './util';

export default function useScrollLocker(lock?: Ref<boolean>) {
  const UNIQUE_ID = ref(`rc-util-locker-${Date.now()}`);

  let uuid = 0;

  const mergedLock = computed(() => !!lock.value);
  const id = computed(() => {
    uuid += 1;
    return `${UNIQUE_ID.value}_${uuid}`;
  });

  watch(
    [mergedLock, id],
    async ([val1, val2]) => {
      await nextTick();
      if (val1) {
        const scrollbarSize = getTargetScrollBarSize(document.body).width;
        const isOverflow = isBodyOverflowing();

        updateCSS(
          `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
          val2,
        );
      } else {
        removeCSS(val2);
      }
    },
    { flush: 'post', immediate: true },
  );

  onBeforeUnmount(() => {
    removeCSS(id.value);
  });
}
