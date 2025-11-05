import { computed, type Ref } from 'vue';
import type { ColumnType, StickyOffsets } from '../interface';

/**
 * Get sticky column offset width
 */
function useStickyOffsets<RecordType>(colWidths: Ref<number[]>, flattenColumns: Ref<ColumnType<RecordType>[]>) {
  const stickyOffsets = computed<StickyOffsets>(() => {
    const columnCount = flattenColumns.value.length;

    const getOffsets = (startIndex: number, endIndex: number, offset: number) => {
      const offsets: number[] = [];
      let total = 0;

      for (let i = startIndex; i !== endIndex; i += offset) {
        offsets.push(total);

        if (flattenColumns.value[i].fixed) {
          total += colWidths.value[i] || 0;
        }
      }

      return offsets;
    };

    const startOffsets = getOffsets(0, columnCount, 1);
    const endOffsets = getOffsets(columnCount - 1, -1, -1).reverse();

    return {
      start: startOffsets,
      end: endOffsets,
      widths: colWidths.value,
    };
  });

  return stickyOffsets;
}

export default useStickyOffsets;
