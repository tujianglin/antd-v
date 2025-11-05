<script lang="ts">
import type { ColumnType } from '../interface';

export interface ColumnProps<RecordType> extends ColumnType<RecordType> {}

function Column<RecordType>(_: ColumnProps<RecordType>) {
  return null;
}

export default Column;
</script>
