// ==================================================================================
// ==                                 getCellProps                                 ==

import type { VueKey } from '@/vc-util/type';
import type useRowInfo from '../hooks/useRowInfo';
import type { ColumnType } from '../interface';

// ==================================================================================
export function getCellProps<RecordType>(
  rowInfo: ReturnType<typeof useRowInfo<RecordType>>,
  column: ColumnType<RecordType>,
  colIndex: number,
  indent: number,
  index: number,
  rowKeys: VueKey[] = [],
  expandedRowOffset = 0,
) {
  const {
    record,
    prefixCls,
    columnsKey,
    fixedInfoList,
    nestExpandable,
    indentSize,
    expandIcon,
    expanded,
    hasNestChildren,
    onTriggerExpand,
    expandable,
    expandedKeys,
  } = rowInfo;

  const key = columnsKey[colIndex];
  const fixedInfo = fixedInfoList[colIndex];

  // ============= Used for nest expandable =============
  let appendCellNode;
  if (colIndex === 0 && nestExpandable) {
    appendCellNode = (
      <>
        <span style={{ paddingLeft: `${indentSize * indent}px` }} class={`${prefixCls}-row-indent indent-level-${indent}`} />
        {expandIcon({
          prefixCls,
          expanded,
          expandable: hasNestChildren,
          record,
          onExpand: onTriggerExpand,
        })}
      </>
    );
  }

  const additionalCellProps = column.onCell?.(record as any, index) || {};

  // Expandable row has offset
  if (expandedRowOffset) {
    const rowspan = (additionalCellProps.rowspan as number) ?? 1;
    // For expandable row with rowspan,
    // We should increase the rowspan if the row is expanded
    if (expandable && rowspan && colIndex < expandedRowOffset) {
      let currentRowSpan = rowspan;

      for (let i = index; i < index + rowspan; i += 1) {
        const rowKey = rowKeys[i];
        if (expandedKeys.has(rowKey)) {
          currentRowSpan += 1;
        }
      }
      additionalCellProps.rowspan = currentRowSpan;
    }
  }

  return {
    key,
    fixedInfo,
    appendCellNode,
    additionalCellProps,
  };
}

export function getColumnWidth(colIndex: number, colSpan: number, columnsOffset: number[]) {
  const mergedColSpan = colSpan || 1;
  return columnsOffset[colIndex + mergedColSpan] - (columnsOffset[colIndex] || 0);
}
