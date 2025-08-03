import { reactiveComputed } from '@vueuse/core';
import { toRefs, type Ref } from 'vue';
import type { GetKey, GetSize } from '../interface';
import type CacheMap from '../utils/CacheMap';

/**
 * Size info need loop query for the `heights` which will has the perf issue.
 * Let cache result for each render phase.
 */
export function useGetSize<T>(mergedData: Ref<T[]>, getKey: GetKey<T>, heights: Ref<CacheMap>, itemHeight: Ref<number>) {
  const { key2Index, bottomList } = toRefs(
    reactiveComputed(() => {
      mergedData.value; // 引用以建立依赖关系
      heights.value.id;
      itemHeight.value;

      const key2Index = new Map<unknown, number>();
      const bottomList: number[] = [];
      return { key2Index, bottomList } as const;
    }),
  );
  const getSize: GetSize = (startKey, endKey = startKey) => {
    // Get from cache first
    let startIndex = key2Index.value.get(startKey);
    let endIndex = key2Index.value.get(endKey);

    // Loop to fill the cache
    if (startIndex === undefined || endIndex === undefined) {
      const dataLen = mergedData.value.length;
      for (let i = bottomList.value.length; i < dataLen; i += 1) {
        const item = mergedData.value[i];
        const key = getKey(item);
        key2Index.value.set(key, i);
        const cacheHeight = heights.value.get(key) ?? itemHeight.value;
        bottomList.value[i] = (bottomList.value[i - 1] || 0) + cacheHeight;
        if (key === startKey) {
          startIndex = i;
        }
        if (key === endKey) {
          endIndex = i;
        }

        if (startIndex !== undefined && endIndex !== undefined) {
          break;
        }
      }
    }

    return {
      top: bottomList.value?.[startIndex - 1] || 0,
      bottom: bottomList.value?.[endIndex] || 0,
    };
  };

  return getSize;
}
