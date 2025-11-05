<script lang="ts">
import type { ColumnType } from '../interface';

export interface ColumnGroupProps<RecordType> extends ColumnType<RecordType> {}

/* istanbul ignore next */
/**
 * This is a syntactic sugar for `columns` prop.
 * So HOC will not work on this.
 */
function ColumnGroup<RecordType>(_: ColumnGroupProps<RecordType>) {
  return null;
}

export default ColumnGroup;
</script>
