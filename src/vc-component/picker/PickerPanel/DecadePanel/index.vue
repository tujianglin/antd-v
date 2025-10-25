<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, getCurrentInstance } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { formatValue, isInRange, isSameDecade } from '../../utils/dateUtil';
import { PanelContextProvider, useInfo } from '../context';
import PanelBody from '../PanelBody.vue';
import PanelHeader from '../PanelHeader.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, locale, generateConfig, pickerValue, disabledDate, onPickerValueChange } = defineProps<SharedPanelProps>();

const panelPrefixCls = computed(() => `${prefixCls}-decade-panel`);

const vm = getCurrentInstance();
// ========================== Base ==========================
const [info] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => 'decade'),
);

const getStartYear = (date) => {
  const startYear = Math.floor(generateConfig.getYear(date) / 100) * 100;
  return generateConfig.setYear(date, startYear);
};
const getEndYear = (date) => {
  const startYear = getStartYear(date);
  return generateConfig.addYear(startYear, 99);
};

const startYearDate = computed(() => getStartYear(pickerValue));
const endYearDate = computed(() => getEndYear(pickerValue));

const baseDate = computed(() => generateConfig.addYear(startYearDate.value, -10));

// ========================= Cells ==========================
const getCellDate = (date, offset: number) => {
  return generateConfig.addYear(date, offset * 10);
};

const getCellText = (date) => {
  const cellYearFormat = locale.cellYearFormat;

  const startYearStr = formatValue(date, {
    locale,
    format: cellYearFormat,
    generateConfig,
  });
  const endYearStr = formatValue(generateConfig.addYear(date, 9), {
    locale,
    format: cellYearFormat,
    generateConfig,
  });

  return `${startYearStr}-${endYearStr}`;
};

const getCellClassName = (date) => {
  return {
    [`${prefixCls}-cell-in-view`]:
      isSameDecade(generateConfig, date, startYearDate.value) ||
      isSameDecade(generateConfig, date, endYearDate.value) ||
      isInRange(generateConfig, startYearDate.value, endYearDate.value, date),
  };
};

// ======================== Disabled ========================
const mergedDisabledDate = computed(() => {
  return disabledDate
    ? (currentDate, disabledInfo) => {
        // Start
        const baseStartDate = generateConfig.setDate(currentDate, 1);
        const baseStartMonth = generateConfig.setMonth(baseStartDate, 0);
        const baseStartYear = generateConfig.setYear(
          baseStartMonth,
          Math.floor(generateConfig.getYear(baseStartMonth) / 10) * 10,
        );

        // End
        const baseEndYear = generateConfig.addYear(baseStartYear, 10);
        const baseEndDate = generateConfig.addDate(baseEndYear, -1);

        return disabledDate(baseStartYear, disabledInfo) && disabledDate(baseEndDate, disabledInfo);
      }
    : null;
});

// ========================= Header =========================
const yearNode = computed(
  () =>
    `${formatValue(startYearDate.value, {
      locale,
      format: locale.yearFormat,
      generateConfig,
    })}-${formatValue(endYearDate.value, {
      locale,
      format: locale.yearFormat,
      generateConfig,
    })}`,
);
</script>
<template>
  <PanelContextProvider :value="info">
    <div :class="panelPrefixCls">
      <PanelHeader
        :super-offset="(distance) => generateConfig.addYear(pickerValue, distance * 100)"
        @change="onPickerValueChange"
        :get-start="getStartYear"
        :get-end="getEndYear"
      >
        {{ yearNode }}
      </PanelHeader>

      <PanelBody
        v-bind="$props"
        :disabled-date="mergedDisabledDate"
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
