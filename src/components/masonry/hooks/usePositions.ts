// Disabled the rule since `fill` is safe here
// but `Array.from` will increase bundle size.

import type { VueKey } from '@/vc-util/type';
import { computed, type Ref } from 'vue';

export type ItemHeightData = [key: VueKey, height: number, column?: number];

export type ItemPositions = Map<VueKey, { column: number; top: number }>;

/**
 * Auto arrange the items in the masonry layout.
 * Always get stable positions by order
 * instead of dynamic adjust for next item height.
 */
export default function usePositions(itemHeights: Ref<ItemHeightData[]>, columnCount: Ref<number>, verticalGutter: Ref<number>) {
  // ==================== Auto Order ====================
  const orderState = computed(() => {
    const columnHeights = new Array(columnCount.value).fill(0) as number[];
    const itemPositions: ItemPositions = new Map();

    for (let i = 0; i < itemHeights.value.length; i += 1) {
      const [itemKey, itemHeight, itemColumn] = itemHeights.value[i];

      let targetColumnIndex = itemColumn ?? columnHeights.indexOf(Math.min(...columnHeights));
      targetColumnIndex = Math.min(targetColumnIndex, columnCount.value - 1);

      const top = columnHeights[targetColumnIndex];
      itemPositions.set(itemKey, {
        column: targetColumnIndex,
        top,
      });

      columnHeights[targetColumnIndex] += itemHeight + verticalGutter.value;
    }

    return [itemPositions, Math.max(0, Math.max(...columnHeights) - verticalGutter.value)];
  });

  // ====================== Return ======================
  return [computed(() => orderState.value?.[0]), computed(() => orderState.value?.[1])] as const;
}
