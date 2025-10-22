<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, getCurrentInstance } from 'vue';
import type { PanelMode, SharedPanelProps } from '../../interface';
import { formatValue, getWeekStartDate, isSameDate, isSameMonth, WEEK_DAY_COUNT } from '../../utils/dateUtil';
import { PanelContextProvider, useInfo } from '../context';
import clsx from 'clsx';
import PanelHeader from '../PanelHeader.vue';
import Render from '@/vc-component/render';
import PanelBody from '../PanelBody.vue';
import type { DateType } from '@/vc-util/type';

export interface DatePanelProps extends SharedPanelProps {
  panelName?: PanelMode;
  rowClassName?: (date: DateType) => string;

  /** Used for `WeekPanel` */
  mode?: PanelMode;
  cellSelection?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  panelName = 'date',
  locale,
  generateConfig,
  pickerValue,
  onPickerValueChange,
  onModeChange,
  mode = 'date',
  disabledDate,
  onSelect,
  onHover,
  showWeek,
} = defineProps<DatePanelProps>();

const vm = getCurrentInstance();

const panelPrefixCls = computed(() => `${prefixCls}-${panelName}-panel`);

const cellPrefixCls = computed(() => `${prefixCls}-cell`);

const isWeek = computed(() => mode === 'week');

// ========================== Base ==========================
const [info, now] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => mode),
);
const weekFirstDay = computed(() => generateConfig.locale.getWeekFirstDay(locale.locale));
const monthStartDate = computed(() => generateConfig.setDate(pickerValue, 1));
const baseDate = computed(() => getWeekStartDate(locale.locale, generateConfig, monthStartDate.value));
const month = computed(() => generateConfig.getMonth(pickerValue));

// =========================== PrefixColumn ===========================
const showPrefixColumn = computed(() => (showWeek === undefined ? isWeek.value : showWeek));
const prefixColumn = computed(() => {
  return showPrefixColumn.value
    ? (date: DateType) => {
        // >>> Additional check for disabled
        const disabled = disabledDate?.(date, { type: 'week' });

        return (
          <td
            key="week"
            class={clsx(cellPrefixCls.value, `${cellPrefixCls.value}-week`, {
              [`${cellPrefixCls.value}-disabled`]: disabled,
            })}
            // Operation: Same as code in PanelBody
            onClick={() => {
              if (!disabled) {
                onSelect(date);
              }
            }}
            onMouseenter={() => {
              if (!disabled) {
                onHover?.(date);
              }
            }}
            onMouseleave={() => {
              if (!disabled) {
                onHover?.(null);
              }
            }}
          >
            <div class={`${cellPrefixCls.value}-inner`}>{generateConfig.locale.getWeek(locale.locale, date)}</div>
          </td>
        );
      }
    : null;
});

// ========================= Cells ==========================
// >>> Header Cells
const headerCells = computed(() => {
  const result = [];
  const weekDaysLocale: string[] =
    locale.shortWeekDays || (generateConfig.locale.getShortWeekDays ? generateConfig.locale.getShortWeekDays(locale.locale) : []);

  if (prefixColumn.value) {
    result.push(
      <th key="empty">
        <span style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }}>{locale.week}</span>
      </th>,
    );
  }
  for (let i = 0; i < WEEK_DAY_COUNT; i += 1) {
    result.push(<th key={i}>{weekDaysLocale[(i + weekFirstDay.value) % WEEK_DAY_COUNT]}</th>);
  }
  return result;
});

// >>> Body Cells
const getCellDate = (date: DateType, offset: number) => {
  return generateConfig.addDate(date, offset);
};

const getCellText = (date: DateType) => {
  return formatValue(date, {
    locale,
    format: locale.cellDateFormat,
    generateConfig,
  });
};

const getCellClassName = (date: DateType) => {
  const classObj = {
    [`${prefixCls}-cell-in-view`]: isSameMonth(generateConfig, date, pickerValue),
    [`${prefixCls}-cell-today`]: isSameDate(generateConfig, date, now.value),
  };

  return classObj;
};

// ========================= Header =========================
const monthsLocale = computed<string[]>(
  () => locale.shortMonths || (generateConfig.locale.getShortMonths ? generateConfig.locale.getShortMonths(locale.locale) : []),
);

const yearNode = () => (
  <button
    type="button"
    aria-label={locale.yearSelect}
    key="year"
    onClick={() => {
      onModeChange('year', pickerValue);
    }}
    tabindex={-1}
    class={`${prefixCls}-year-btn`}
  >
    {formatValue(pickerValue, {
      locale,
      format: locale.yearFormat,
      generateConfig,
    })}
  </button>
);
const monthNode = () => (
  <button
    type="button"
    aria-label={locale.monthSelect}
    key="month"
    onClick={() => {
      onModeChange('month', pickerValue);
    }}
    tabindex={-1}
    class={`${prefixCls}-month-btn`}
  >
    {locale.monthFormat
      ? formatValue(pickerValue, {
          locale,
          format: locale.monthFormat,
          generateConfig,
        })
      : monthsLocale.value[month.value]}
  </button>
);

const monthYearNodes = computed(() => (locale.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode]));
</script>
<template>
  <PanelContextProvider :value="info">
    <div :class="clsx(panelPrefixCls, showWeek && `${panelPrefixCls}-show-week`)">
      <PanelHeader
        :offset="(distance) => generateConfig.addMonth(pickerValue, distance)"
        :super-offset="(distance) => generateConfig.addYear(pickerValue, distance)"
        @change="onPickerValueChange"
        :get-start="(date) => generateConfig.setDate(date, 1)"
        :get-end="
          (date) => {
            let clone = generateConfig.setDate(date, 1);
            clone = generateConfig.addMonth(clone, 1);
            return generateConfig.addDate(clone, -1);
          }
        "
      >
        <Render :content="monthYearNodes[0]" />
        <Render :content="monthYearNodes[1]" />
      </PanelHeader>

      <PanelBody
        :title-format="locale.fieldDateFormat"
        v-bind="$props"
        :col-num="WEEK_DAY_COUNT"
        :row-num="6"
        :base-date="baseDate"
        :header-cells="headerCells"
        :get-cell-date="getCellDate"
        :get-cell-text="getCellText"
        :get-cell-class-name="getCellClassName"
        :prefix-column="prefixColumn"
        :cell-selection="!isWeek"
      />
    </div>
  </PanelContextProvider>
</template>
