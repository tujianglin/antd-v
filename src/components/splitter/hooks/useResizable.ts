import { ref, watch, type ComputedRef } from 'vue';
import type { ItemType } from './useItems';

export type ResizableInfo = {
  resizable: boolean;
  startCollapsible: boolean;
  endCollapsible: boolean;
};

export default function useResizable(items: ItemType[], pxSizes: ComputedRef<number[]>) {
  const resizeInfos = ref([]);
  watch(pxSizes, (val) => {
    const list = [];

    for (let i = 0; i < items.length - 1; i += 1) {
      const prevItem = items[i];
      const nextItem = items[i + 1];
      const prevSize = val[i];
      const nextSize = val[i + 1];
      const { resizable: prevResizable = true, min: prevMin, collapsible: prevCollapsible } = prevItem;
      const { resizable: nextResizable = true, min: nextMin, collapsible: nextCollapsible } = nextItem;

      const mergedResizable = prevResizable && nextResizable && (prevSize !== 0 || !prevMin) && (nextSize !== 0 || !nextMin);

      const startCollapsible = (prevCollapsible.end && prevSize > 0) || (nextCollapsible.start && nextSize === 0 && prevSize > 0);

      const endCollapsible = (nextCollapsible.start && nextSize > 0) || (prevCollapsible.end && prevSize === 0 && nextSize > 0);
      list[i] = {
        resizable: mergedResizable,
        startCollapsible: !!startCollapsible,
        endCollapsible: !!endCollapsible,
      };
    }
    resizeInfos.value = list;
  });

  return resizeInfos;
}
