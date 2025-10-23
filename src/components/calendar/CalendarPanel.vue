<script lang="tsx" setup>
import type { BasePickerPanelProps as RcBasePickerPanelProps } from '@/vc-component/picker';
import type { CellRenderInfo } from '@/vc-component/picker/interface';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import enUS from './locale/en_US';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import { computed, toRaw, toRefs, type CSSProperties } from 'vue';
import { reactiveComputed } from '@vueuse/core';
import type { GenerateConfig } from '@/vc-component/picker/generate';
import useControlledState from '@/vc-util/hooks/useControlledState';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import CalendarHeader from './Header/index.vue';
import { PickerPanel as RCPickerPanel } from '@/vc-component/picker';

export type CalendarMode = 'year' | 'month';
export type HeaderRender = (config: {
  value: DateType;
  type: CalendarMode;
  onChange: (date: DateType) => void;
  onTypeChange: (type: CalendarMode) => void;
}) => VueNode;

export interface SelectInfo {
  source: 'year' | 'month' | 'date' | 'customize';
}
export type DateType = any;

type SemanticName = 'root' | 'header' | 'body' | 'content' | 'item';
export interface CalendarProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  locale?: typeof enUS;
  validRange?: [DateType, DateType];
  disabledDate?: (date: DateType) => boolean;
  monthCellRender?: (date: DateType) => VueNode;
  cellRender?: (date: DateType, info: CellRenderInfo) => VueNode;
  fullCellRender?: (date: DateType, info: CellRenderInfo) => VueNode;
  headerRender?: HeaderRender;
  value?: DateType;
  defaultValue?: DateType;
  mode?: CalendarMode;
  fullscreen?: boolean;
  showWeek?: boolean;
  onChange?: (date: DateType) => void;
  onPanelChange?: (date: DateType, mode: CalendarMode) => void;
  onSelect?: (date: DateType, selectInfo: SelectInfo) => void;
}

defineOptions({ name: 'Calendar', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  monthCellRender,
  cellRender,
  fullCellRender,
  headerRender,
  value,
  defaultValue,
  disabledDate,
  mode,
  validRange,
  fullscreen = true,
  showWeek,
  onChange,
  onPanelChange,
  onSelect,
  styles,
  classNames: calendarClassNames,
  generateConfig,
  locale: customLocale,
} = defineProps<CalendarProps & { generateConfig?: GenerateConfig }>();

const isSameYear = (date1: DateType, date2: DateType, config: GenerateConfig) => {
  const { getYear } = config;
  return date1 && date2 && getYear(date1) === getYear(date2);
};

const isSameMonth = (date1: DateType, date2: DateType, config: GenerateConfig) => {
  const { getMonth } = config;
  return isSameYear(date1, date2, config) && getMonth(date1) === getMonth(date2);
};

const isSameDate = (date1: DateType, date2: DateType, config: GenerateConfig) => {
  const { getDate } = config;
  return isSameMonth(date1, date2, config) && getDate(date1) === getDate(date2);
};

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('calendar'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, calendarClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const { rootCls, headerCls, panelClassNames, rootStyle, headerStyle, panelStyles } = toRefs(
  reactiveComputed(() => {
    const { root: nextRootClassName, header: nextHeaderClassName, ...nextPanelClassNames } = mergedClassNames.value;
    const { root: nextRootStyle, header: nextHeaderStyle, ...nextPanelStyles } = mergedStyles.value;
    return {
      rootCls: nextRootClassName,
      headerCls: nextHeaderClassName,
      panelClassNames: nextPanelClassNames,
      rootStyle: nextRootStyle,
      headerStyle: nextHeaderStyle,
      panelStyles: nextPanelStyles,
    };
  }),
);

const prefixCls = computed(() => getPrefixCls.value('picker', customizePrefixCls));
const calendarPrefixCls = computed(() => `${prefixCls.value}-calendar`);

const [hashId, cssVarCls] = useStyle(prefixCls, calendarPrefixCls);

const today = computed(() => generateConfig.getNow());

// ====================== State =======================

// Value
const [mergedValue, setMergedValue] = useControlledState(
  defaultValue || value || generateConfig.getNow(),
  computed(() => value),
);

// Mode
const [mergedMode, setMergedMode] = useControlledState(
  'month',
  computed(() => mode),
);
const panelMode = computed<'month' | 'date'>(() => (mergedMode.value === 'year' ? 'month' : 'date'));

// Disabled Date
const mergedDisabledDate = (date: DateType) => {
  const notInRange = validRange
    ? generateConfig.isAfter(validRange[0], date) || generateConfig.isAfter(date, validRange[1])
    : false;
  return notInRange || !!disabledDate?.(date);
};

// ====================== Events ======================
const triggerPanelChange = (date: DateType, newMode: CalendarMode) => {
  onPanelChange?.(date, newMode);
};

const triggerChange = (date: DateType) => {
  if (!isSameDate(date, mergedValue.value, generateConfig)) {
    // Trigger when month panel switch month
    if (
      (panelMode.value === 'date' && !isSameMonth(date, toRaw(mergedValue.value), generateConfig)) ||
      (panelMode.value === 'month' && !isSameYear(date, toRaw(mergedValue.value), generateConfig))
    ) {
      triggerPanelChange(date, mergedMode.value);
    }

    onChange?.(date);
  }
  setMergedValue(date);
};

const triggerModeChange = (newMode: CalendarMode) => {
  setMergedMode(newMode);
  triggerPanelChange(mergedValue.value, newMode);
};

const onInternalSelect = (date: DateType, source: SelectInfo['source']) => {
  triggerChange(date);

  onSelect?.(date, { source });
};

// ====================== Render ======================
const dateRender = (date: DateType, info: CellRenderInfo): VueNode => {
  if (fullCellRender) {
    return fullCellRender(date, info);
  }

  return (
    <div
      class={clsx(`${prefixCls.value}-cell-inner`, `${calendarPrefixCls.value}-date`, {
        [`${calendarPrefixCls.value}-date-today`]: isSameDate(today.value, date, generateConfig),
      })}
    >
      <div class={`${calendarPrefixCls.value}-date-value`}>{String(generateConfig.getDate(date)).padStart(2, '0')}</div>
      <div class={`${calendarPrefixCls.value}-date-content`}>{cellRender?.(date, info)}</div>
    </div>
  );
};

const monthRender = (date: DateType, info: CellRenderInfo): VueNode => {
  if (fullCellRender) {
    return fullCellRender(date, info);
  }

  const months = info.locale!.shortMonths || generateConfig.locale.getShortMonths!(info.locale!.locale);

  return (
    <div
      class={clsx(`${prefixCls.value}-cell-inner`, `${calendarPrefixCls.value}-date`, {
        [`${calendarPrefixCls.value}-date-today`]: isSameMonth(today.value, date, generateConfig),
      })}
    >
      <div class={`${calendarPrefixCls.value}-date-value`}>{months[generateConfig.getMonth(date)]}</div>
      <div class={`${calendarPrefixCls.value}-date-content`}>{cellRender ? cellRender(date, info) : monthCellRender?.(date)}</div>
    </div>
  );
};

const [contextLocale] = useLocale('Calendar', enUS);

const locale = computed(() => ({ ...contextLocale.value, ...customLocale }));

const mergedCellRender: RcBasePickerPanelProps['cellRender'] = (current, info) => {
  if (info.type === 'date') {
    return dateRender(current, info);
  }

  if (info.type === 'month') {
    return monthRender(current, {
      ...info,
      locale: locale.value?.lang,
    });
  }
};
</script>
<template>
  <div
    :class="
      clsx(
        calendarPrefixCls,
        {
          [`${calendarPrefixCls}-full`]: fullscreen,
          [`${calendarPrefixCls}-mini`]: !fullscreen,
          [`${calendarPrefixCls}-rtl`]: direction === 'rtl',
        },
        contextClassName,
        className,
        rootClassName,
        rootCls,
        hashId,
        cssVarCls,
      )
    "
    :style="{ ...rootStyle, ...contextStyle, ...style }"
  >
    <template v-if="headerRender">
      <Render
        :content="
          headerRender({
            value: mergedValue,
            type: mergedMode,
            onChange: (nextDate) => {
              onInternalSelect(nextDate, 'customize');
            },
            onTypeChange: triggerModeChange,
          })
        "
      />
    </template>
    <CalendarHeader
      v-else
      :class="headerCls"
      :style="headerStyle"
      :prefix-cls="calendarPrefixCls"
      :value="mergedValue"
      :generate-config="generateConfig"
      :mode="mergedMode"
      :fullscreen="fullscreen"
      :locale="locale?.lang"
      :valid-range="validRange"
      @change="onInternalSelect"
      @mode-change="triggerModeChange"
    />
    <RCPickerPanel
      :class-names="panelClassNames"
      :styles="panelStyles"
      :value="mergedValue"
      :prefix-cls="prefixCls"
      :locale="locale?.lang"
      :generate-config="generateConfig"
      :cell-render="mergedCellRender"
      @select="
        (nextDate) => {
          onInternalSelect(nextDate, panelMode);
        }
      "
      :mode="panelMode"
      :picker="panelMode"
      :disabled-date="mergedDisabledDate"
      hide-header
      :show-week="showWeek"
    />
  </div>
</template>
