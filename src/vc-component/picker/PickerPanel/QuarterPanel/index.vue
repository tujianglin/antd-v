<script lang="tsx" setup>
import { computed, getCurrentInstance } from 'vue';
import type { SharedPanelProps } from '../../interface';
import { PanelContextProvider, useInfo } from '../context';
import { reactiveComputed } from '@vueuse/core';
import { formatValue } from '../../utils/dateUtil';
import PanelHeader from '../PanelHeader.vue';
import PanelBody from '../PanelBody.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, locale, generateConfig, pickerValue, onPickerValueChange, onModeChange } = defineProps<SharedPanelProps>();

const panelPrefixCls = computed(() => `${prefixCls}-quarter-panel`);

const vm = getCurrentInstance();
// ========================== Base ==========================
const [info] = useInfo(
  reactiveComputed(() => vm.props as any),
  computed(() => 'quarter'),
);

// ========================== Base ==========================
const baseDate = computed(() => generateConfig.setMonth(pickerValue, 0));

// ========================= Cells ==========================
const getCellDate = (date, offset: number) => {
  return generateConfig.addMonth(date, offset * 3);
};

const getCellText = (date) => {
  return formatValue(date, {
    locale,
    format: locale.cellQuarterFormat,
    generateConfig,
  });
};

const getCellClassName = () => ({
  [`${prefixCls}-cell-in-view`]: true,
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
        :super-offset="(distance) => generateConfig.addYear(pickerValue, distance)"
        @change="onPickerValueChange"
        :get-start="(date) => generateConfig.setMonth(date, 0)"
        :get-end="(date) => generateConfig.setMonth(date, 11)"
      >
        <YearNode />
      </PanelHeader>

      <PanelBody
        v-bind="$props"
        :title-format="locale.fieldQuarterFormat"
        :col-num="4"
        :row-num="1"
        :base-date="baseDate"
        :get-cell-date="getCellDate"
        :get-cell-text="getCellText"
        :get-cell-class-name="getCellClassName"
      />
    </div>
  </PanelContextProvider>
</template>
