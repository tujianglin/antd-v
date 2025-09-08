<script lang="tsx" setup>
import { computed, toRefs } from 'vue';
import type { DisabledDate } from '../interface';
import { formatValue, isInRange, isSame } from '../utils/dateUtil';
import { usePanelContextInject, usePickerHackContextInject } from './context';
import clsx from 'clsx';
import { Render } from '@/components';

export interface PanelBodyProps<DateType = any> {
  rowNum: number;
  colNum: number;
  baseDate: DateType;

  titleFormat?: string;

  // Render
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => any;
  getCellClassName: (date: DateType) => Record<string, any>;

  disabledDate?: DisabledDate<DateType>;

  // Used for date panel
  headerCells?: any[];

  // Used for week panel
  prefixColumn?: (date: DateType) => any;
  rowClassName?: (date: DateType) => string;
  cellSelection?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rowNum,
  colNum,
  baseDate,
  getCellDate,
  prefixColumn,
  rowClassName,
  titleFormat,
  getCellText,
  getCellClassName,
  headerCells,
  cellSelection = true,
  disabledDate,
} = defineProps<PanelBodyProps>();

const {
  prefixCls,
  classNames,
  styles,
  panelType: type,
  now,
  disabledDate: contextDisabledDate,
  cellRender,
  onHover,
  hoverValue,
  hoverRangeValue,
  generateConfig,
  values,
  locale,
  onSelect,
} = toRefs(usePanelContextInject());

const mergedDisabledDate = computed(() => disabledDate || contextDisabledDate?.value);

const cellPrefixCls = `${prefixCls.value}-cell`;

// ============================= Context ==============================
const { onCellDblClick } = toRefs(usePickerHackContextInject());

// ============================== Value ===============================
const matchValues = (date) =>
  values.value.some((singleValue) => singleValue && isSame(generateConfig?.value, locale?.value, date, singleValue, type?.value));

const Rows = () => {
  // =============================== Body ===============================
  const rows = [];

  for (let row = 0; row < rowNum; row += 1) {
    const rowNode = [];
    let rowStartDate;

    for (let col = 0; col < colNum; col += 1) {
      const offset = row * colNum + col;
      const currentDate = getCellDate(baseDate, offset);

      const disabled = mergedDisabledDate?.value?.(currentDate, {
        type: type.value,
      });

      // Row Start Cell
      if (col === 0) {
        rowStartDate = currentDate;

        if (prefixColumn) {
          rowNode.push(prefixColumn(rowStartDate));
        }
      }

      // Range
      let inRange = false;
      let rangeStart = false;
      let rangeEnd = false;

      if (cellSelection && hoverRangeValue.value) {
        const [hoverStart, hoverEnd] = hoverRangeValue.value;
        inRange = isInRange(generateConfig.value, hoverStart, hoverEnd, currentDate);
        rangeStart = isSame(generateConfig.value, locale.value, currentDate, hoverStart, type.value);
        rangeEnd = isSame(generateConfig.value, locale.value, currentDate, hoverEnd, type.value);
      }

      // Title
      const title = titleFormat
        ? formatValue(currentDate, {
            locale: locale.value,
            format: titleFormat,
            generateConfig: generateConfig.value,
          })
        : undefined;

      // Render
      const inner = <div class={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>;

      rowNode.push(
        <td
          key={col}
          title={title}
          class={clsx(cellPrefixCls, classNames.value.item, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-hover`]: (hoverValue.value || []).some((date) =>
              isSame(generateConfig.value, locale.value, currentDate, date, type.value),
            ),
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            [`${prefixCls.value}-cell-selected`]:
              !hoverRangeValue.value &&
              // WeekPicker use row instead
              type.value !== 'week' &&
              matchValues(currentDate),
            ...getCellClassName(currentDate),
          })}
          style={styles.value.item}
          onClick={() => {
            if (!disabled) {
              onSelect?.value?.(currentDate);
            }
          }}
          onDblclick={() => {
            if (!disabled && onCellDblClick) {
              onCellDblClick?.value?.();
            }
          }}
          onMouseenter={() => {
            if (!disabled) {
              onHover?.value?.(currentDate);
            }
          }}
          onMouseleave={() => {
            if (!disabled) {
              onHover?.value?.(null);
            }
          }}
        >
          {cellRender.value
            ? cellRender.value?.(currentDate, {
                prefixCls: prefixCls.value,
                originNode: inner,
                today: now.value,
                type: type.value,
                locale: locale.value,
              })
            : inner}
        </td>,
      );
    }

    rows.push(
      <tr key={row} class={rowClassName?.(rowStartDate!)}>
        {rowNode}
      </tr>,
    );
  }
  return rows;
};
</script>
<template>
  <div :class="clsx(`${prefixCls}-body`, classNames.body)" :style="styles.body">
    <table :class="clsx(`${prefixCls}-content`, classNames.content)" :style="styles.content">
      <thead v-if="headerCells">
        <tr>
          <Render :content="headerCells" />
        </tr>
      </thead>
      <tbody>
        <Rows />
      </tbody>
    </table>
  </div>
</template>
