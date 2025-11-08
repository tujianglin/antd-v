import type { AnyObject } from '@/vc-util/type';
import type { Ref } from 'vue';
import type { ColumnGroupType, ColumnsType, ColumnTitleProps, ColumnType } from '../interface';
import { renderColumnTitle } from '../util';

const fillTitle = <RecordType extends AnyObject = AnyObject>(
  columns: ColumnsType<RecordType>,
  columnTitleProps: ColumnTitleProps<RecordType>,
) => {
  const finalColumns = columns?.map((column) => {
    const cloneColumn: ColumnGroupType<RecordType> | ColumnType<RecordType> = { ...column };
    cloneColumn.title = renderColumnTitle(column.title, columnTitleProps);
    if ('children' in cloneColumn) {
      cloneColumn.children = fillTitle<RecordType>(cloneColumn.children, columnTitleProps);
    }
    return cloneColumn;
  });
  return finalColumns;
};

const useTitleColumns = <RecordType extends AnyObject = AnyObject>(columnTitleProps: Ref<ColumnTitleProps<RecordType>>) => {
  const filledColumns = (columns) => fillTitle<RecordType>(columns, columnTitleProps.value);
  return [filledColumns] as const;
};

export default useTitleColumns;
