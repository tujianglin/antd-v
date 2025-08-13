import { nextTick, ref, watch, type Ref } from 'vue';
import raf from '../../../vc-util/raf';
import warning from '../../../vc-util/warning';
import type { GetKey } from '../interface';
import type CacheMap from '../utils/CacheMap';

const MAX_TIMES = 10;

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export type ScrollPos = {
  left?: number;
  top?: number;
};

export type ScrollTarget =
  | {
      index: number;
      align?: ScrollAlign;
      offset?: number;
    }
  | {
      key: PropertyKey;
      align?: ScrollAlign;
      offset?: number;
    };

export default function useScrollTo<T>(
  containerRef: Ref<HTMLDivElement>,
  data: Ref<T[]>,
  heights: Ref<CacheMap>,
  itemHeight: Ref<number>,
  getKey: GetKey<T>,
  collectHeight: () => void,
  syncScrollTop: (newTop: number) => void,
  triggerFlash: () => void,
): (arg: number | ScrollTarget) => void {
  const scrollRef = ref<number>();

  const syncState = ref<{
    times: number;
    index: number;
    offset: number;
    originAlign: ScrollAlign;
    targetAlign?: 'top' | 'bottom';
    lastTop?: number;
  }>(null);

  // ========================== Sync Scroll ==========================
  watch(
    [() => syncState.value, () => containerRef.value],
    async () => {
      await nextTick();
      if (syncState && syncState.value?.times < MAX_TIMES) {
        // Never reach
        if (!containerRef.value) {
          syncState.value = { ...syncState.value };
          return;
        }

        collectHeight();

        const { targetAlign, originAlign, index, offset } = syncState.value;

        const height = containerRef.value.clientHeight;
        let needCollectHeight = false;
        let newTargetAlign: 'top' | 'bottom' | null = targetAlign;
        let targetTop: number | null = null;

        // Go to next frame if height not exist
        if (height) {
          const mergedAlign = targetAlign || originAlign;

          // Get top & bottom
          let stackTop = 0;
          let itemTop = 0;
          let itemBottom = 0;

          const maxLen = Math.min(data.value.length - 1, index);

          for (let i = 0; i <= maxLen; i += 1) {
            const key = getKey(data.value[i]);
            itemTop = stackTop;
            const cacheHeight = heights.value.get(key);
            itemBottom = itemTop + (cacheHeight === undefined ? itemHeight.value : cacheHeight);

            stackTop = itemBottom;
          }

          // Check if need sync height (visible range has item not record height)
          let leftHeight = mergedAlign === 'top' ? offset : height - offset;
          for (let i = maxLen; i >= 0; i -= 1) {
            const key = getKey(data.value[i]);
            const cacheHeight = heights.value.get(key);

            if (cacheHeight === undefined) {
              needCollectHeight = true;
              break;
            }

            leftHeight -= cacheHeight;
            if (leftHeight <= 0) {
              break;
            }
          }

          // Scroll to
          switch (mergedAlign) {
            case 'top':
              targetTop = itemTop - offset;
              break;
            case 'bottom':
              targetTop = itemBottom - height + offset;
              break;

            default: {
              const { scrollTop } = containerRef.value;
              const scrollBottom = scrollTop + height;
              if (itemTop < scrollTop) {
                newTargetAlign = 'top';
              } else if (itemBottom > scrollBottom) {
                newTargetAlign = 'bottom';
              }
            }
          }

          if (targetTop !== null) {
            syncScrollTop(targetTop);
          }

          // One more time for sync
          if (targetTop !== syncState.value.lastTop) {
            needCollectHeight = true;
          }
        }

        // Trigger next effect
        if (needCollectHeight) {
          syncState.value = {
            ...syncState.value,
            times: syncState.value.times + 1,
            targetAlign: newTargetAlign,
            lastTop: targetTop,
          };
        }
      } else if (process.env.NODE_ENV !== 'production' && syncState.value?.times === MAX_TIMES) {
        warning(false, 'Seems `scrollTo` with `rc-virtual-list` reach the max limitation. Please fire issue for us. Thanks.');
      }
    },
    { flush: 'post', immediate: true, deep: true },
  );

  // =========================== Scroll To ===========================
  return (arg) => {
    // When not argument provided, we think dev may want to show the scrollbar
    if (arg === null || arg === undefined) {
      triggerFlash();
      return;
    }

    // Normal scroll logic
    raf.cancel(scrollRef.value);

    if (typeof arg === 'number') {
      syncScrollTop(arg);
    } else if (arg && typeof arg === 'object') {
      let index: number;
      const { align } = arg;

      if ('index' in arg) {
        ({ index } = arg);
      } else {
        index = data.value.findIndex((item) => getKey(item) === arg.key);
      }

      const { offset = 0 } = arg;

      syncState.value = {
        times: 0,
        index,
        offset,
        originAlign: align,
      };
    }
  };
}
