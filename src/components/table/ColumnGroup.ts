import type { AnyObject } from '../_util/type';
import type { ColumnType } from './interface';

export interface ColumnGroupProps<RecordType = AnyObject> extends Omit<ColumnType<RecordType>, 'children'> {}

/* istanbul ignore next */
/** This is a syntactic sugar for `columns` prop. So HOC will not work on this. */

const ColumnGroup = <RecordType extends AnyObject>(_: ColumnGroupProps<RecordType>) => null;

export default ColumnGroup;
