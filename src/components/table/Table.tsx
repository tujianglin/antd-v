import { EXPAND_COLUMN, Summary } from '@/vc-component/table';
import Column from './Column';
import ColumnGroup from './ColumnGroup';
import { SELECTION_ALL, SELECTION_COLUMN, SELECTION_INVERT, SELECTION_NONE } from './hooks/useSelection';
import InternalTable from './Table.vue';

type ForwardTable = typeof InternalTable & {
  SELECTION_COLUMN: typeof SELECTION_COLUMN;
  EXPAND_COLUMN: typeof EXPAND_COLUMN;
  SELECTION_ALL: typeof SELECTION_ALL;
  SELECTION_INVERT: typeof SELECTION_INVERT;
  SELECTION_NONE: typeof SELECTION_NONE;
  Column: typeof Column;
  ColumnGroup: typeof ColumnGroup;
  Summary: typeof Summary;
};

const Table = InternalTable as ForwardTable;

Table.SELECTION_COLUMN = SELECTION_COLUMN;
Table.EXPAND_COLUMN = EXPAND_COLUMN;
Table.SELECTION_ALL = SELECTION_ALL;
Table.SELECTION_INVERT = SELECTION_INVERT;
Table.SELECTION_NONE = SELECTION_NONE;
Table.Column = Column;
Table.ColumnGroup = ColumnGroup;
Table.Summary = Summary;

export default Table;
