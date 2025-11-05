import { clsx } from 'clsx';
import type { ExpandableConfig, GetRowKey, Key, RenderExpandIconProps } from '../interface';

export function renderExpandIcon<RecordType>({
  prefixCls,
  record,
  onExpand,
  expanded,
  expandable,
}: RenderExpandIconProps<RecordType>) {
  const expandClassName = `${prefixCls}-row-expand-icon`;

  if (!expandable) {
    return <span class={clsx(expandClassName, `${prefixCls}-row-spaced`)} />;
  }

  const onClick = (event: MouseEvent) => {
    onExpand(record, event as any);
    event.stopPropagation();
  };

  return (
    <span
      class={clsx(expandClassName, {
        [`${prefixCls}-row-expanded`]: expanded,
        [`${prefixCls}-row-collapsed`]: !expanded,
      })}
      onClick={onClick}
    />
  );
}

export function findAllChildrenKeys<RecordType>(
  data: RecordType[],
  getRowKey: GetRowKey<RecordType>,
  childrenColumnName: string,
): Key[] {
  const keys: Key[] = [];

  function dig(list: RecordType[]) {
    (list || []).forEach((item, index) => {
      keys.push(getRowKey(item, index));

      dig((item as any)[childrenColumnName]);
    });
  }

  dig(data);

  return keys;
}

export function computedExpandedClassName<RecordType>(
  cls: ExpandableConfig<RecordType>['expandedRowClassName'],
  record: RecordType,
  index: number,
  indent: number,
) {
  if (typeof cls === 'string') {
    return cls;
  }
  if (typeof cls === 'function') {
    return cls(record, index, indent);
  }
  return '';
}
