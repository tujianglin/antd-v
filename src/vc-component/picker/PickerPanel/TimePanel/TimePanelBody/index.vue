<script lang="tsx" setup generic="DateType extends object = any">
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs } from 'vue';
import useTimeInfo, { type Unit } from '../../../hooks/useTimeInfo';
import type { SharedPanelProps, SharedTimeProps } from '../../../interface';
import { formatValue } from '../../../utils/dateUtil';
import { usePanelContextInject, usePickerHackContextInject } from '../../context';
import TimeColumn from './TimeColumn.vue';

export type TimePanelBodyProps<DateType extends object = any> = SharedPanelProps<DateType>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Show Config
  showHour,
  showMinute,
  showSecond,
  showMillisecond,
  use12Hours: showMeridiem,

  // MISC
  changeOnScroll,
} = defineProps<SharedTimeProps<DateType>>();

function isAM(hour: number) {
  return hour < 12;
}

const {
  prefixCls,
  classNames,
  styles,
  values,
  generateConfig,
  locale,
  onSelect,
  onHover: _onHover,
  pickerValue,
} = toRefs(usePanelContextInject());

const vm = getCurrentInstance();

const onHover = computed(() => _onHover?.value || (() => {}));

const value = computed(() => values?.value?.[0] || null);

const { onCellDblClick } = toRefs(usePickerHackContextInject());

// ========================== Info ==========================
const [getValidTime, rowHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits] = useTimeInfo(
  generateConfig,
  computed(() => vm.props as any),
  value,
);

// ========================= Value ==========================
// PickerValue will tell which one to align on the top
const getUnitValue = (
  func: 'getHour' | 'getMinute' | 'getSecond' | 'getMillisecond',
): { valueNum: number; pickerNum: number } => {
  const valueUnitVal = value.value && generateConfig?.value?.[func]?.(value.value);
  const pickerUnitValue = pickerValue.value && generateConfig?.value?.[func](pickerValue.value);

  return { valueNum: valueUnitVal, pickerNum: pickerUnitValue };
};

const { valueNum: hour, pickerNum: pickerHour } = toRefs(reactiveComputed(() => getUnitValue('getHour')));
const { valueNum: minute, pickerNum: pickerMinute } = toRefs(reactiveComputed(() => getUnitValue('getMinute')));
const { valueNum: second, pickerNum: pickerSecond } = toRefs(reactiveComputed(() => getUnitValue('getSecond')));
const { valueNum: millisecond, pickerNum: pickerMillisecond } = toRefs(reactiveComputed(() => getUnitValue('getMillisecond')));
const meridiem = computed(() => (hour.value === null ? null : isAM(hour.value) ? 'am' : 'pm'));

// ========================= Column =========================
// Hours
const hourUnits = computed(() => {
  if (!showMeridiem) {
    return rowHourUnits.value;
  }

  return isAM(hour.value)
    ? rowHourUnits.value.filter((h) => isAM(h.value as number))
    : rowHourUnits.value.filter((h) => !isAM(h.value as number));
});

// >>> Pick Fallback
const getEnabled = (units: Unit<number>[], val: number) => {
  const enabledUnits = units.filter((unit) => !unit.disabled);

  return (
    val ??
    // Fallback to enabled value
    enabledUnits?.[0]?.value
  );
};

// >>> Minutes
const validHour = computed(() => getEnabled(rowHourUnits.value, hour.value));
const minuteUnits = computed(() => getMinuteUnits?.value?.(validHour.value));

// >>> Seconds
const validMinute = computed(() => getEnabled(minuteUnits.value, minute.value));
const secondUnits = computed(() => getSecondUnits?.value?.(validHour.value, validMinute.value));

// >>> Milliseconds
const validSecond = computed(() => getEnabled(secondUnits.value, second.value));
const millisecondUnits = computed(() => getMillisecondUnits?.value?.(validHour.value, validMinute.value, validSecond.value));

const validMillisecond = computed(() => getEnabled(millisecondUnits.value, millisecond.value));

// Meridiem
const meridiemUnits = computed(() => {
  if (!showMeridiem) {
    return [];
  }

  const base = generateConfig.value.getNow();
  const amDate = generateConfig.value.setHour(base, 6);
  const pmDate = generateConfig.value.setHour(base, 18);

  const formatMeridiem = (date: DateType, defaultLabel: string) => {
    const { cellMeridiemFormat } = locale.value;
    return cellMeridiemFormat
      ? formatValue(date, {
          generateConfig: generateConfig.value,
          locale: locale.value,
          format: cellMeridiemFormat,
        })
      : defaultLabel;
  };

  return [
    {
      label: formatMeridiem(amDate, 'AM'),
      value: 'am',
      disabled: rowHourUnits.value.every((h) => h.disabled || !isAM(h.value as number)),
    },
    {
      label: formatMeridiem(pmDate, 'PM'),
      value: 'pm',
      disabled: rowHourUnits.value.every((h) => h.disabled || isAM(h.value as number)),
    },
  ];
});

// ========================= Change =========================
/**
 * Check if time is validate or will match to validate one
 */
const triggerChange = (nextDate: DateType) => {
  const validateDate = getValidTime(nextDate);

  onSelect?.value?.(validateDate);
};

// ========================= Column =========================
// Create a template date for the trigger change event
const triggerDateTmpl = computed(() => {
  let tmpl = value.value || pickerValue.value || generateConfig.value.getNow();

  const isNotNull = (num: number) => num !== null && num !== undefined;

  if (isNotNull(hour.value)) {
    tmpl = generateConfig.value.setHour(tmpl, hour.value);
    tmpl = generateConfig.value.setMinute(tmpl, minute.value);
    tmpl = generateConfig.value.setSecond(tmpl, second.value);
    tmpl = generateConfig.value.setMillisecond(tmpl, millisecond.value);
  } else if (isNotNull(pickerHour.value)) {
    tmpl = generateConfig.value.setHour(tmpl, pickerHour.value);
    tmpl = generateConfig.value.setMinute(tmpl, pickerMinute.value);
    tmpl = generateConfig.value.setSecond(tmpl, pickerSecond.value);
    tmpl = generateConfig.value.setMillisecond(tmpl, pickerMillisecond.value);
  } else if (isNotNull(validHour.value)) {
    tmpl = generateConfig.value.setHour(tmpl, validHour.value);
    tmpl = generateConfig.value.setMinute(tmpl, validMinute.value);
    tmpl = generateConfig.value.setSecond(tmpl, validSecond.value);
    tmpl = generateConfig.value.setMillisecond(tmpl, validMillisecond.value);
  }

  return tmpl;
});

// ===================== Columns Change =====================
const fillColumnValue = (val: number | string, func: 'setHour' | 'setMinute' | 'setSecond' | 'setMillisecond') => {
  if (val === null) {
    return null;
  }
  return generateConfig.value[func](triggerDateTmpl.value, val as any);
};

const getNextHourTime = (val: number) => fillColumnValue(val, 'setHour');
const getNextMinuteTime = (val: number) => fillColumnValue(val, 'setMinute');
const getNextSecondTime = (val: number) => fillColumnValue(val, 'setSecond');
const getNextMillisecondTime = (val: number) => fillColumnValue(val, 'setMillisecond');
const getMeridiemTime = (val: string) => {
  if (val === null) {
    return null;
  }

  if (val === 'am' && !isAM(hour.value)) {
    return generateConfig.value.setHour(triggerDateTmpl.value, hour.value - 12);
  } else if (val === 'pm' && isAM(hour.value)) {
    return generateConfig.value.setHour(triggerDateTmpl.value, hour.value + 12);
  }
  return triggerDateTmpl.value;
};

const onHourChange = (val) => {
  triggerChange(getNextHourTime(val));
};

const onMinuteChange = (val) => {
  triggerChange(getNextMinuteTime(val));
};

const onSecondChange = (val) => {
  triggerChange(getNextSecondTime(val));
};

const onMillisecondChange = (val) => {
  triggerChange(getNextMillisecondTime(val));
};

const onMeridiemChange = (val) => {
  triggerChange(getMeridiemTime(val));
};

// ====================== Column Hover ======================
const onHourHover = (val) => {
  onHover?.value?.(getNextHourTime(val));
};

const onMinuteHover = (val) => {
  onHover?.value?.(getNextMinuteTime(val));
};

const onSecondHover = (val) => {
  onHover?.value?.(getNextSecondTime(val));
};

const onMillisecondHover = (val) => {
  onHover?.value?.(getNextMillisecondTime(val));
};

const onMeridiemHover = (val) => {
  onHover?.value?.(getMeridiemTime(val));
};

// ========================= Render =========================
const sharedColumnProps = computed(() => ({
  onDblClick: onCellDblClick?.value,
  changeOnScroll,
}));
</script>
<template>
  <div :class="clsx(`${prefixCls}-content`, classNames.content)" :style="styles.content">
    <TimeColumn
      v-if="showHour"
      :units="hourUnits"
      :value="hour"
      :optional-value="pickerHour"
      type="hour"
      @change="onHourChange"
      @hover="onHourHover"
      v-bind="sharedColumnProps"
    />
    <TimeColumn
      v-if="showMinute"
      :units="minuteUnits"
      :value="minute"
      :optional-value="pickerMinute"
      type="minute"
      @change="onMinuteChange"
      @hover="onMinuteHover"
      v-bind="sharedColumnProps"
    />
    <TimeColumn
      v-if="showSecond"
      :units="secondUnits"
      :value="second"
      :optional-value="pickerSecond"
      type="second"
      @change="onSecondChange"
      @hover="onSecondHover"
      v-bind="sharedColumnProps"
    />
    <TimeColumn
      v-if="showMillisecond"
      :units="millisecondUnits"
      :value="millisecond"
      :optional-value="pickerMillisecond"
      type="millisecond"
      @change="onMillisecondChange"
      @hover="onMillisecondHover"
      v-bind="sharedColumnProps"
    />
    <TimeColumn
      v-if="showMeridiem"
      :units="meridiemUnits"
      :value="meridiem"
      type="meridiem"
      @change="onMeridiemChange"
      @hover="onMeridiemHover"
      v-bind="sharedColumnProps"
    />
  </div>
</template>
