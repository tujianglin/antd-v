<script lang="tsx" setup>
import { computed, getCurrentInstance } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { PanelContextProvider, useInfo } from '../context';
import { reactiveComputed } from '@vueuse/core';
import { formatValue } from '../../utils/dateUtil';
import PanelHeader from '../PanelHeader.vue';
import PanelBody from '../PanelBody.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, locale, generateConfig, pickerValue, disabledDate, onPickerValueChange, onModeChange } =
  defineProps<SharedPanelProps>();

const panelPrefixCls = computed(() => `${prefixCls}-month-panel`);

const vm = getCurrentInstance();
// ========================== Base ==========================
const [info] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => 'month'),
);

// ========================== Base ==========================
const baseDate = computed(() => generateConfig.setMonth(pickerValue, 0));

// ========================= Month ==========================
const monthsLocale = computed<string[]>(
  () => locale.shortMonths || (generateConfig.locale.getShortMonths ? generateConfig.locale.getShortMonths(locale.locale) : []),
);

// ========================= Cells ==========================
const getCellDate = (date, offset: number) => {
  return generateConfig.addMonth(date, offset);
};

const getCellText = (date) => {
  const month = generateConfig.getMonth(date);

  return locale.monthFormat
    ? formatValue(date, {
        locale,
        format: locale.monthFormat,
        generateConfig,
      })
    : monthsLocale.value[month];
};

const getCellClassName = () => ({
  [`${prefixCls}-cell-in-view`]: true,
});

// ======================== Disabled ========================
const mergedDisabledDate = computed(() => {
  return disabledDate
    ? (currentDate, disabledInfo) => {
        const startDate = generateConfig.setDate(currentDate, 1);
        const nextMonthStartDate = generateConfig.setMonth(startDate, generateConfig.getMonth(startDate) + 1);
        const endDate = generateConfig.addDate(nextMonthStartDate, -1);

        return disabledDate(startDate, disabledInfo) && disabledDate(endDate, disabledInfo);
      }
    : null;
});

// ========================= Header =========================
const YearNode = () => (
  <button
    type="button"
    key="year"
    aria-label={locale.yearSelect}
    onClick={() => {
      onModeChange('year');
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
</script>
<template>
  <PanelContextProvider :value="info">
    <div :class="panelPrefixCls">
      <PanelHeader
        :super-offset="(distance) => generateConfig.addYear(pickerValue, distance * 10)"
        @change="onPickerValueChange"
        :get-start="(date) => generateConfig.setMonth(date, 0)"
        :get-end="(date) => generateConfig.setMonth(date, 11)"
      >
        <YearNode />
      </PanelHeader>

      <PanelBody
        v-bind="$props"
        :disabled-date="mergedDisabledDate"
        :title-format="locale.fieldMonthFormat"
        :col-num="3"
        :row-num="4"
        :base-date="baseDate"
        :get-cell-date="getCellDate"
        :get-cell-text="getCellText"
        :get-cell-class-name="getCellClassName"
      />
    </div>
  </PanelContextProvider>
</template>
