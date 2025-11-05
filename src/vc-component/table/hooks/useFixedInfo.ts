import { computed, type Ref } from 'vue';
import type { ColumnType, StickyOffsets } from '../interface';
import { getCellFixedInfo } from '../utils/fixUtil';

export default function useFixedInfo<RecordType>(
  flattenColumns: Ref<ColumnType<RecordType>[]>,
  stickyOffsets: Ref<StickyOffsets>,
) {
  return computed(() =>
    flattenColumns.value.map((_, colIndex) => getCellFixedInfo(colIndex, colIndex, flattenColumns.value, stickyOffsets.value)),
  );
}
