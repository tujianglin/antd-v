<!-- eslint-disable unused-imports/no-unused-vars -->
<!-- eslint-disable no-unused-vars -->
<script lang="tsx" setup generic="DateType extends object = any">
import useControlledState from '@/vc-util/hooks/useControlledState';
import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, watch, type CSSProperties } from 'vue';
import useLocale from '../hooks/useLocale';
import { fillShowTimeConfig, getTimeProps } from '../hooks/useTimeConfig';
import useToggleDates from '../hooks/useToggleDates';
import type {
  CellRender,
  Components,
  InternalMode,
  OnPanelChange,
  PanelMode,
  PanelSemanticName,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../interface';
import { usePickerContextInject } from '../PickerInput/context';
import useCellRender from '../PickerInput/hooks/useCellRender';
import { isSame } from '../utils/dateUtil';
import { pickProps, toArray } from '../utils/miscUtil';
import { PickerHackContextProvider, SharedPanelContextProvider, usePickerHackContextInject } from './context';
import DatePanel from './DatePanel/index.vue';
import DateTimePanel from './DateTimePanel/index.vue';
import DecadePanel from './DecadePanel/index.vue';
import MonthPanel from './MonthPanel/index.vue';
import QuarterPanel from './QuarterPanel/index.vue';
import TimePanel from './TimePanel/index.vue';
import WeekPanel from './WeekPanel/index.vue';
import YearPanel from './YearPanel/index.vue';

export interface PickerPanelRef {
  nativeElement: HTMLDivElement;
}

export interface BasePickerPanelProps<DateType extends object = any>
  extends Pick<
      SharedPanelProps<DateType>,
      // MISC
      | 'locale'
      | 'generateConfig'

      // Disabled
      | 'disabledDate'
      | 'minDate'
      | 'maxDate'

      // Icon
      | 'prevIcon'
      | 'nextIcon'
      | 'superPrevIcon'
      | 'superNextIcon'
    >,
    SharedTimeProps<DateType> {
  tabindex?: number;
  // Style
  prefixCls?: string;

  direction?: 'ltr' | 'rtl';

  // Value
  onSelect?: (date: DateType) => void;

  // Panel control
  defaultPickerValue?: DateType | null;
  pickerValue?: DateType | null;
  onPickerValueChange?: (date: DateType) => void;

  // Mode
  mode?: PanelMode;
  /**
   * Compatible with origin API.
   * Not mean the PickerPanel `onChange` event.
   */
  onPanelChange?: OnPanelChange<DateType>;
  picker?: PickerMode;

  // Time
  showTime?: true | SharedTimeProps<DateType>;

  // Week
  /**
   * Only worked in `date` mode. Show the current week
   */
  showWeek?: boolean;

  // Cell
  cellRender?: CellRender<DateType>;

  // Hover
  /** @private Used for Picker passing */
  hoverValue?: DateType[] | null | undefined;
  /** @private Used for Picker passing */
  hoverRangeValue?: [start: DateType, end: DateType];
  /** @private Used for Picker passing */
  onHover?: (date: DateType) => void;

  // Components
  components?: Components;

  /** @private This is internal usage. Do not use in your production env */
  hideHeader?: boolean;
}

export interface SinglePickerPanelProps<DateType extends object = any> extends BasePickerPanelProps<DateType> {
  multiple?: false;

  defaultValue?: DateType | null;
  value?: DateType | null;
  onChange?: (date: DateType) => void;
}

export type PickerPanelProps<DateType extends object = any> = BasePickerPanelProps<DateType> & {
  /** multiple selection. Not support time or datetime picker */
  multiple?: boolean;

  defaultValue?: DateType | DateType[] | null;
  value?: DateType | DateType[] | null;
  onChange?: (date: DateType | DateType[]) => void;
  styles?: Partial<Record<PanelSemanticName, CSSProperties>>;
  classNames?: Partial<Record<PanelSemanticName, string>>;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  classNames: panelClassNames,
  styles: panelStyles,

  locale,
  generateConfig,

  direction,

  // Style
  prefixCls,
  tabindex = 0,

  // Value
  multiple,
  defaultValue,
  value,
  onChange,
  onSelect,

  // Picker control
  defaultPickerValue,
  pickerValue,
  onPickerValueChange,

  // Mode
  mode,
  onPanelChange,
  picker = 'date',
  showTime,

  // Hover
  hoverValue,
  hoverRangeValue,

  // Cell
  cellRender,

  // Components
  components = {},

  hideHeader,
} = defineProps<PickerPanelProps<DateType>>();

const DefaultComponents: Components = {
  date: DatePanel,
  datetime: DateTimePanel,
  week: WeekPanel,
  month: MonthPanel,
  quarter: QuarterPanel,
  year: YearPanel,
  decade: DecadePanel,
  time: TimePanel,
};

// ======================== Context ========================
const { prefixCls: contextPrefixCls, classNames: pickerClassNames, styles: pickerStyles } = toRefs(usePickerContextInject());

// ======================== prefixCls ========================
const mergedPrefixCls = computed(() => contextPrefixCls?.value || prefixCls || 'rc-picker');

// ========================== Refs ==========================
const rootRef = ref<HTMLDivElement>();

defineExpose({
  get nativeElement() {
    return rootRef.value;
  },
});

const vm = getCurrentInstance();

// ========================== Time ==========================
// Auto `format` need to check `showTime.showXXX` first.
// And then merge the `locale` into `mergedShowTime`.
const { timeProps, localeTimeProps, showTimeFormat, propFormat } = toRefs(reactiveComputed(() => getTimeProps(vm.props as any)));

// ========================= Locale =========================
const filledLocale = useLocale(
  computed(() => locale),
  localeTimeProps,
);

// ========================= Picker =========================
const internalPicker = computed<InternalMode>(() => (picker === 'date' && showTime ? 'datetime' : picker));

// ======================== ShowTime ========================
const mergedShowTime = computed<any>(() => {
  return fillShowTimeConfig(internalPicker.value, showTimeFormat.value, propFormat.value, timeProps.value, filledLocale.value);
});

// ========================== Now ===========================
const now = computed(() => generateConfig.getNow());

// ========================== Mode ==========================
const [mergedMode, setMergedMode] = useControlledState<PanelMode>(
  picker || 'date',
  computed(() => mode),
);

const internalMode = computed(() => (mergedMode.value === 'date' && mergedShowTime.value ? 'datetime' : mergedMode.value));

// ========================= Toggle =========================
const toggleDates = useToggleDates(
  computed(() => generateConfig),
  computed(() => locale),
  internalPicker,
);

// ========================= Value ==========================
// >>> Real value
// Interactive with `onChange` event which only trigger when the `mode` is `picker`
const [innerValue, setMergedValue] = useControlledState(
  defaultValue,
  computed(() => value),
);

const mergedValue = computed(() => {
  // Clean up `[null]`
  const values = toArray(innerValue.value).filter((val) => val);
  return multiple ? values : values.slice(0, 1);
});

// Sync value and only trigger onChange event when changed
const triggerChange = (nextValue) => {
  setMergedValue(nextValue);

  if (
    onChange &&
    (nextValue === null ||
      mergedValue.value.length !== nextValue.length ||
      mergedValue.value.some((ori, index) => !isSame(generateConfig, locale, ori, nextValue[index], internalPicker.value)))
  ) {
    onChange?.(multiple ? nextValue : nextValue[0]);
  }
};

// >>> CalendarValue
// CalendarValue is a temp value for user operation
// which will only trigger `onCalendarChange` but not `onChange`
const onInternalSelect = (newDate: DateType) => {
  onSelect?.(newDate);

  if (mergedMode.value === picker) {
    const nextValues = multiple ? toggleDates(mergedValue.value, newDate) : [newDate];

    triggerChange(nextValues);
  }
};

// >>> PickerValue
// PickerValue is used to control the current displaying panel
const [mergedPickerValue, setInternalPickerValue] = useControlledState(
  defaultPickerValue || mergedValue.value[0] || now.value,
  computed(() => pickerValue),
);

watch(
  () => mergedValue.value[0],
  () => {
    if (mergedValue.value[0] && !pickerValue) {
      setInternalPickerValue(mergedValue.value[0]);
    }
  },
  { immediate: true, deep: true },
);

// Both trigger when manually pickerValue or mode change
const triggerPanelChange = (viewDate?: DateType, nextMode?: PanelMode) => {
  onPanelChange?.(viewDate || pickerValue, nextMode || mergedMode.value);
};

const setPickerValue = (nextPickerValue: DateType, triggerPanelEvent = false) => {
  setInternalPickerValue(nextPickerValue);

  onPickerValueChange?.(nextPickerValue);

  if (triggerPanelEvent) {
    triggerPanelChange(nextPickerValue);
  }
};

const triggerModeChange = (nextMode, viewDate?) => {
  setMergedMode(nextMode);

  if (viewDate) {
    setPickerValue(viewDate);
  }

  triggerPanelChange(viewDate, nextMode);
};

const onPanelValueSelect = (nextValue: DateType) => {
  onInternalSelect(nextValue);
  setPickerValue(nextValue);

  // Update mode if needed
  if (mergedMode.value !== picker) {
    const decadeYearQueue: PanelMode[] = ['decade', 'year'];
    const decadeYearMonthQueue: PanelMode[] = [...decadeYearQueue, 'month'];

    const pickerQueue: Partial<Record<PickerMode, PanelMode[]>> = {
      quarter: [...decadeYearQueue, 'quarter'],
      week: [...decadeYearMonthQueue, 'week'],
      date: [...decadeYearMonthQueue, 'date'],
    };

    const queue = pickerQueue[picker] || decadeYearMonthQueue;
    const index = queue.indexOf(mergedMode.value);
    const nextMode = queue[index + 1];

    if (nextMode) {
      triggerModeChange(nextMode, nextValue);
    }
  }
};

// ======================= Hover Date =======================
const hoverRangeDate = computed<[DateType, DateType] | null>(() => {
  let start: DateType;
  let end: DateType;

  if (Array.isArray(hoverRangeValue)) {
    [start, end] = hoverRangeValue;
  } else {
    start = hoverRangeValue;
  }

  // Return for not exist
  if (!start && !end) {
    return null;
  }

  // Fill if has empty
  start = start || end;
  end = end || start;

  return generateConfig.isAfter(start, end) ? [end, start] : [start, end];
});

// ======================= Components =======================
// >>> cellRender
const onInternalCellRender = useCellRender(computed(() => cellRender));

// ======================= Components =======================
const PanelComponent = computed(
  () => (components[internalMode.value] || DefaultComponents[internalMode.value] || DatePanel) as typeof DatePanel,
);

// ======================== Context =========================
const sharedPanelContext = computed(() => ({
  classNames: pickerClassNames?.value?.popup ?? panelClassNames ?? {},
  styles: pickerStyles?.value?.popup ?? panelStyles ?? {},
}));

const parentHackContext = usePickerHackContextInject();
const pickerPanelContext = computed(() => ({
  ...parentHackContext,
  hideHeader,
}));

// ======================== Warnings ========================
if (process.env.NODE_ENV !== 'production') {
  warning(
    !mergedValue.value || mergedValue.value.every((val) => generateConfig.isValidate(val)),
    'Invalidate date pass to `value` or `defaultValue`.',
  );
}

// ========================= Render =========================
const panelCls = computed(() => `${mergedPrefixCls.value}-panel`);

const panelProps = computed(() => {
  return pickProps(vm.props, [
    // Week
    'showWeek',

    // Icons
    'prevIcon',
    'nextIcon',
    'superPrevIcon',
    'superNextIcon',

    // Disabled
    'disabledDate',
    'minDate',
    'maxDate',

    // Hover
    'onHover',
  ]);
});
</script>
<template>
  <SharedPanelContextProvider :value="sharedPanelContext">
    <PickerHackContextProvider :value="pickerPanelContext">
      <div
        ref="rootRef"
        :tabindex="tabindex"
        :class="
          clsx(panelCls, {
            [`${panelCls}-rtl`]: direction === 'rtl',
          })
        "
      >
        <PanelComponent
          v-bind="panelProps"
          :show-time="mergedShowTime"
          :prefix-cls="mergedPrefixCls"
          :locale="filledLocale"
          :generate-config="generateConfig"
          @mode-change="triggerModeChange"
          :picker-value="mergedPickerValue"
          @picker-value-change="
            (nextPickerValue) => {
              setPickerValue(nextPickerValue, true);
            }
          "
          :value="mergedValue[0]"
          @select="onPanelValueSelect"
          :values="mergedValue"
          :cell-render="onInternalCellRender"
          :hover-range-value="hoverRangeDate"
          :hover-value="hoverValue"
        />
      </div>
    </PickerHackContextProvider>
  </SharedPanelContextProvider>
</template>
