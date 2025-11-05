import { computed, toRefs, type Ref } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type { OnHover } from '../hooks/useHover';

/** Check if cell is in hover range */
function inHoverRange(cellStartRow: number, cellRowSpan: number, startRow: number, endRow: number) {
  const cellEndRow = cellStartRow + cellRowSpan - 1;
  return cellStartRow <= endRow && cellEndRow >= startRow;
}

export default function useHoverState(
  rowIndex: Ref<number>,
  rowspan: Ref<number>,
): [hovering: Ref<boolean>, onHover: Ref<OnHover>] {
  const { onHover, hoverStartRow, hoverEndRow } = toRefs(useTableContextInject());

  const hovering = computed(() => inHoverRange(rowIndex.value, rowspan.value || 1, hoverStartRow?.value, hoverEndRow?.value));

  return [hovering, onHover];
}
