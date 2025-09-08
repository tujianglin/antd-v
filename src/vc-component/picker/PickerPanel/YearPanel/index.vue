<script lang="tsx" setup>
import { computed, getCurrentInstance } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { PanelContextProvider, useInfo } from '../context';
import { reactiveComputed } from '@vueuse/core';
import { formatValue, isInRange, isSameYear } from '../../utils/dateUtil';
import PanelHeader from '../PanelHeader.vue';
import PanelBody from '../PanelBody.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, locale, generateConfig, pickerValue, disabledDate, onPickerValueChange, onModeChange } =
  defineProps<SharedPanelProps>();

const panelPrefixCls = computed(() => `${prefixCls}-year-panel`);

const vm = getCurrentInstance();
// ========================== Base ==========================
const [info] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => 'year'),
);
const getStartYear = (date) => {
  const startYear = Math.floor(generateConfig.getYear(date) / 10) * 10;
  return generateConfig.setYear(date, startYear);
};
const getEndYear = (date) => {
  const startYear = getStartYear(date);
  return generateConfig.addYear(startYear, 9);
};

const startYearDate = computed(() => getStartYear(pickerValue));
const endYearDate = computed(() => getEndYear(pickerValue));

const baseDate = computed(() => generateConfig.addYear(startYearDate.value, -1));

// ========================= Cells ==========================
const getCellDate = (date, offset: number) => {
  return generateConfig.addYear(date, offset);
};

const getCellText = (date) => {
  return formatValue(date, {
    locale,
    format: locale.cellYearFormat,
    generateConfig,
  });
};

const getCellClassName = (date) => {
  return {
    [`${prefixCls}-cell-in-view`]:
      isSameYear(generateConfig, date, startYearDate.value) ||
      isSameYear(generateConfig, date, endYearDate.value) ||
      isInRange(generateConfig, startYearDate.value, endYearDate.value, date),
  };
};

// ======================== Disabled ========================
const mergedDisabledDate = computed(() => {
  return disabledDate
    ? (currentDate, disabledInfo) => {
        // Start
        const startMonth = generateConfig.setMonth(currentDate, 0);
        const startDate = generateConfig.setDate(startMonth, 1);

        // End
        const endMonth = generateConfig.addYear(startDate, 1);
        const endDate = generateConfig.addDate(endMonth, -1);
        return disabledDate(startDate, disabledInfo) && disabledDate(endDate, disabledInfo);
      }
    : null;
});

// ========================= Header =========================
const YearNode = () => (
  <button
    type="button"
    key="decade"
    aria-label={locale.decadeSelect}
    onClick={() => {
      onModeChange('decade');
    }}
    tabindex={-1}
    class={`${prefixCls}-decade-btn`}
  >
    {formatValue(startYearDate.value, {
      locale,
      format: locale.yearFormat,
      generateConfig,
    })}
    -
    {formatValue(endYearDate.value, {
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
        :get-start="getStartYear"
        :get-end="getEndYear"
      >
        <YearNode />
      </PanelHeader>

      <PanelBody
        v-bind="$props"
        :disabled-date="mergedDisabledDate"
        :title-format="locale.fieldYearFormat"
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
