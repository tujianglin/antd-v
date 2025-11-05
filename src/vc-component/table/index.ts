import { EXPAND_COLUMN, INTERNAL_HOOKS } from './constant';
import { FooterComponents as Summary } from './Footer';
import type { ColumnType, ColumnsType, Reference } from './interface';
import Column from './sugar/Column.vue';
import ColumnGroup from './sugar/ColumnGroup.vue';
import type { TableProps } from './Table.vue';
import ImmutableTable from './Table.vue';
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil';
import VirtualTable from './VirtualTable';

export {
  Column,
  ColumnGroup,
  EXPAND_COLUMN,
  INTERNAL_COL_DEFINE,
  INTERNAL_HOOKS,
  Summary,
  VirtualTable,
  type ColumnType,
  type ColumnsType,
  type Reference,
  type TableProps,
};

type ImmutableTableType = typeof ImmutableTable & {
  EXPAND_COLUMN: typeof EXPAND_COLUMN;
  INTERNAL_HOOKS: typeof INTERNAL_HOOKS;
  Column: typeof Column;
  ColumnGroup: typeof ColumnGroup;
  Summary: typeof Summary;
};

const Table = ImmutableTable as ImmutableTableType;
Table.EXPAND_COLUMN = EXPAND_COLUMN;
Table.INTERNAL_HOOKS = INTERNAL_HOOKS;
Table.Column = Column;
Table.ColumnGroup = ColumnGroup;
Table.Summary = Summary;

export default Table;
