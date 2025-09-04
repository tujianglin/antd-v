import wrapperRaf from '@/vc-util/raf';
import type { Ref, ShallowRef, VNodeProps } from 'vue';
import { onUnmounted, ref, watch } from 'vue';
import type { GetKey } from '../interface';
import CacheMap from '../utils/CacheMap';

export default function useHeights<T>(
  mergedData: ShallowRef<any[]>,
  getKey: GetKey<T>,
  onItemAdd?: ((item: T) => void) | null,
  onItemRemove?: ((item: T) => void) | null,
): [(item: T, instance: HTMLElement) => void, () => void, CacheMap, Ref<symbol>] {
  const instance = new Map<VNodeProps['key'], HTMLElement>();
  const heights = new CacheMap();
  const updatedMark = ref(Symbol('update'));
  watch(mergedData, () => {
    updatedMark.value = Symbol('update');
  });
  let collectRaf: number;

  function cancelRaf() {
    wrapperRaf.cancel(collectRaf);
  }
  function collectHeight() {
    cancelRaf();
    collectRaf = wrapperRaf(() => {
      instance.forEach((element, key: any) => {
        if (element && element.offsetParent) {
          const { offsetHeight } = element;
          if (heights.get(key) !== offsetHeight) {
            updatedMark.value = Symbol('update');
            heights.set(key, element.offsetHeight);
          }
        }
      });
    });
  }

  function setInstance(item: T, ins: HTMLElement) {
    const key = getKey(item);
    const origin = instance.get(key);

    if (ins) {
      instance.set(key, (ins as any).$el || ins);
      collectHeight();
    } else {
      instance.delete(key);
    }

    // Instance changed
    if (!origin !== !ins) {
      if (ins) {
        onItemAdd?.(item);
      } else {
        onItemRemove?.(item);
      }
    }
  }
  onUnmounted(() => {
    cancelRaf();
  });

  return [setInstance, collectHeight, heights, updatedMark];
}
