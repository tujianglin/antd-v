import { computed, type Ref } from 'vue';
import type { Tab, TabOffset, TabOffsetMap, TabSizeMap } from '../interface';

const DEFAULT_SIZE = { width: 0, height: 0, left: 0, top: 0 };

export default function useOffsets(tabs: Ref<Tab[]>, tabSizes: Ref<TabSizeMap>, holderScrollWidth: Ref<number>) {
  return computed<TabOffsetMap>(() => {
    holderScrollWidth.value;
    const map: TabOffsetMap = new Map();

    const lastOffset = tabSizes.value.get(tabs.value[0]?.key) || DEFAULT_SIZE;
    const rightOffset = lastOffset.left + lastOffset.width;

    for (let i = 0; i < tabs.value.length; i += 1) {
      const { key } = tabs.value[i];
      let data = tabSizes.value.get(key);

      // Reuse last one when not exist yet
      if (!data) {
        data = tabSizes.value.get(tabs.value[i - 1]?.key) || DEFAULT_SIZE;
      }

      const entity = (map.get(key) || { ...data }) as TabOffset;

      // Right
      entity.right = rightOffset - entity.left - entity.width;

      // Update entity
      map.set(key, entity);
    }

    return map;
  });
}
