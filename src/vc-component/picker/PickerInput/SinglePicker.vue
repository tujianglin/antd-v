<script lang="tsx" setup generic="DateType extends object = any">
import useMergedState from '@/vc-util/hooks/useMergedState';
import pickAttrs from '@/vc-util/pickAttrs';
import { reactiveComputed, toReactive } from '@vueuse/core';
import { omit } from 'lodash-es';
import { computed, nextTick, ref, toRefs, useTemplateRef, watch } from 'vue';
import useSemantic from '../hooks/useSemantic';
import useToggleDates from '../hooks/useToggleDates';
import type {
  BaseInfo,
  InternalMode,
  PanelMode,
  SelectorProps,
  SharedHTMLAttrs,
  SharedPickerProps,
  SharedTimeProps,
  ValueDate,
} from '../interface';
import { toArray } from '../utils/miscUtil';
import useCellRender from './hooks/useCellRender';
import useFieldsInvalidate from './hooks/useFieldsInvalidate';
import useFilledProps, { type FilledProps } from './hooks/useFilledProps';
import useOpen from './hooks/useOpen';
import usePresets from './hooks/usePresets';
import useRangeActive from './hooks/useRangeActive';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue, { useInnerValue } from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import Popup, { type PopupProps } from './Popup/index.vue';
import { PickerContextProvider } from './context';
import PickerTrigger from '../PickerTrigger/index.vue';
import { pickTriggerProps } from '../PickerTrigger/util';
import clsx from 'clsx';
import SingleSelector from './Selector/SingleSelector/index.vue';

// TODO: isInvalidateDate with showTime.disabledTime should not provide `range` prop

export interface BasePickerProps<DateType extends object = any> extends SharedPickerProps<DateType> {
  // Structure
  id?: string;

  /** Not support `time` or `datetime` picker */
  multiple?: boolean;
  removeIcon?: any;
  /** Only work when `multiple` is in used */
  maxTagCount?: number | 'responsive';

  // Value
  value?: DateType | DateType[] | null;
  defaultValue?: DateType | DateType[];
  onChange?: (date: DateType | DateType[], dateString: string | string[]) => void;
  onCalendarChange?: (date: DateType | DateType[], dateString: string | string[], info: BaseInfo) => void;
  /**  */
  onOk?: (value?: DateType | DateType[]) => void;

  // Placeholder
  placeholder?: string;

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: DateType | null;
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: DateType | null;
  /**
   * Each popup panel `pickerValue` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing.
   */
  onPickerValueChange?: (
    date: DateType,
    info: {
      source: 'reset' | 'panel';
      mode: PanelMode;
    },
  ) => void;

  // Preset
  presets?: ValueDate<DateType>[];

  // Control
  disabled?: boolean;

  // Mode
  mode?: PanelMode;
  onPanelChange?: (values: DateType, modes: PanelMode) => void;
}

export interface PickerProps<DateType extends object = any>
  extends BasePickerProps<DateType>,
    Omit<SharedTimeProps<DateType>, 'format' | 'defaultValue'> {}

/** Internal usage. For cross function get same aligned props */
export type ReplacedPickerProps<DateType extends object = any> = {
  onChange?: (date: DateType | DateType[], dateString: string | string[]) => void;
  onCalendarChange?: (date: DateType | DateType[], dateString: string | string[], info: BaseInfo) => void;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = withDefaults(defineProps<PickerProps<DateType>>(), {
  allowClear: true,
  showNow: true,
  picker: 'date',
  prefixCls: 'rc-picker',
  order: true,
  styles: () => ({}),
  classNames: () => ({}),
  components: () => ({}),
});

// ========================= Prop =========================
const [filledProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate] = useFilledProps(toReactive(props));

const {
  // Style
  prefixCls,
  rootClassName,
  styles: propStyles,
  classNames: propClassNames,

  // Value
  order,
  defaultValue,
  value,
  needConfirm,
  onChange,
  onKeydown,

  // Disabled
  disabled,
  disabledDate,
  minDate,
  maxDate,

  // Open
  defaultOpen,
  open,
  onOpenChange,

  // Picker
  locale,
  generateConfig,
  picker,
  showNow,
  showTime,

  // Mode
  mode,
  onPanelChange,
  onCalendarChange,
  onOk,
  multiple,

  // Picker Value
  defaultPickerValue,
  pickerValue,
  onPickerValueChange,

  // Format
  inputReadOnly,

  suffixIcon,
  removeIcon,

  // Focus
  onFocus,
  onBlur,

  // Presets
  presets,

  // Render
  components,
  cellRender,

  // Native
  onClick,
} = toRefs(toReactive(filledProps) as FilledProps<PickerProps, DateType, object>);

const selectorRef = useTemplateRef('selectorRef');

defineExpose({
  get nativeElement() {
    return selectorRef.value?.nativeElement;
  },
  focus: (options) => {
    selectorRef.value?.focus(options);
  },
  blur: () => {
    selectorRef.value?.blur();
  },
});

// ========================= Util =========================
function pickerParam<T>(values: T | T[]) {
  if (values === null) {
    return null;
  }

  return multiple.value ? values : values[0];
}

const toggleDates = computed(() => useToggleDates<DateType>(generateConfig.value, locale.value, internalPicker.value));

// ======================= Semantic =======================
const { mergedClassNames, mergedStyles } = toRefs(reactiveComputed(() => useSemantic(propClassNames.value, propStyles.value)));

// ========================= Open =========================
const [mergedOpen, triggerOpen] = useOpen(
  open,
  defaultOpen,
  computed(() => [disabled.value]),
  onOpenChange.value,
);

// ======================= Calendar =======================
const onInternalCalendarChange = (dates: DateType[], dateStrings: string[], info: BaseInfo) => {
  if (onCalendarChange?.value) {
    const filteredInfo = {
      ...info,
    };
    delete filteredInfo.range;
    onCalendarChange?.value?.(pickerParam(dates), pickerParam(dateStrings), filteredInfo);
  }
};

const onInternalOk = (dates: DateType[]) => {
  onOk?.value?.(pickerParam(dates));
};

// ======================== Values ========================
const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, triggerOk] = useInnerValue(
  generateConfig,
  locale,
  formatList,
  computed(() => false),
  order,
  defaultValue,
  value,
  onInternalCalendarChange,
  onInternalOk,
);

const calendarValue = computed(() => getCalendarValue());

// ======================== Active ========================
// In SinglePicker, we will always get `activeIndex` is 0.
const [focused, triggerFocus, lastOperation, activeIndex] = useRangeActive(computed(() => [disabled.value]));

const onSharedFocus = (event: FocusEvent) => {
  triggerFocus(true);

  onFocus?.value?.(event, {});
};

const onSharedBlur = (event: FocusEvent) => {
  triggerFocus(false);

  onBlur?.value?.(event, {});
};

// ========================= Mode =========================
const [mergedMode, setMode] = useMergedState(picker.value, {
  defaultValue: mode.value,
});

/** Extends from `mergedMode` to patch `datetime` mode */
const internalMode = computed<InternalMode>(() =>
  mergedMode.value === 'date' && showTime.value ? 'datetime' : mergedMode.value,
);

// ======================= Show Now =======================
const mergedShowNow = computed(() => useShowNow(picker.value, mergedMode.value, showNow.value));

const onInternalChange = computed(
  () =>
    onChange?.value &&
    ((dates, dateStrings) => {
      onChange?.value?.(pickerParam(dates), pickerParam(dateStrings));
    }),
);

// ======================== Value =========================
const [, triggerSubmitChange] = useRangeValue<any>(
  computed(() => ({
    ...filledProps.value,
    onChange: onInternalChange.value,
  })),
  mergedValue,
  setInnerValue,
  calendarValue,
  triggerCalendarChange,
  computed(() => [] as any), //disabled,
  formatList,
  focused,
  mergedOpen,
  isInvalidateDate,
);

// ======================= Validate =======================
const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate(calendarValue as any, isInvalidateDate);

const submitInvalidate = computed(() => submitInvalidates?.value?.some((invalidated) => invalidated));

// ===================== Picker Value =====================
// Proxy to single pickerValue
const onInternalPickerValueChange = (
  dates: DateType[],
  info: BaseInfo & { source: 'reset' | 'panel'; mode: [PanelMode, PanelMode] },
) => {
  if (onPickerValueChange?.value) {
    const cleanInfo = { ...info, mode: info.mode[0] };
    delete cleanInfo.range;
    onPickerValueChange?.value?.(dates[0], cleanInfo);
  }
};

const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
  generateConfig,
  locale,
  calendarValue,
  computed(() => [mergedMode.value]),
  mergedOpen,
  activeIndex,
  internalPicker,
  computed(() => false), // multiplePanel,
  defaultPickerValue,
  pickerValue,
  computed(() => toArray(showTime.value?.defaultOpenValue) || []),
  onInternalPickerValueChange,
  minDate,
  maxDate,
);

// >>> Mode need wait for `pickerValue`
const triggerModeChange = (nextPickerValue: DateType, nextMode: PanelMode, triggerEvent?: boolean) => {
  setMode(nextMode);

  // Compatible with `onPanelChange`
  if (onPanelChange?.value && triggerEvent !== false) {
    const lastPickerValue: DateType = nextPickerValue || calendarValue.value[calendarValue.value.length - 1];
    onPanelChange?.value?.(lastPickerValue, nextMode);
  }
};

// ======================== Submit ========================
/**
 * Different with RangePicker, confirm should check `multiple` logic.
 * This will never provide `date` instead.
 */
const triggerConfirm = () => {
  triggerSubmitChange(calendarValue.value);
  triggerOpen(false, { force: true });
};

// ======================== Click =========================
const onSelectorClick = (event: MouseEvent) => {
  if (!disabled.value && !selectorRef.value.nativeElement.contains(document.activeElement)) {
    // Click to focus the enabled input
    selectorRef.value.focus();
  }
  triggerOpen(true);

  onClick?.value?.(event);
};

const onSelectorClear = () => {
  triggerSubmitChange(null);
  triggerOpen(false, { force: true });
};

// ======================== Hover =========================
const hoverSource = ref<'cell' | 'preset'>(null);
const internalHoverValue = ref<DateType>(null);

const hoverValues = computed(() => {
  const values = [internalHoverValue.value, ...calendarValue.value].filter((date) => date);

  return multiple.value ? values : values.slice(0, 1);
});

// Selector values is different with RangePicker
// which can not use `hoverValue` directly
const selectorValues = computed(() => {
  if (!multiple.value && internalHoverValue.value) {
    return [internalHoverValue.value];
  }
  return calendarValue.value.filter((date) => date);
});

// Clean up `internalHoverValues` when closed
watch(
  mergedOpen,
  () => {
    if (!mergedOpen.value) {
      internalHoverValue.value = null;
    }
  },
  { immediate: true },
);

// ========================================================
// ==                       Panels                       ==
// ========================================================
// ======================= Presets ========================
const presetList = usePresets(presets);

const onPresetHover = (nextValue: DateType | null) => {
  internalHoverValue.value = nextValue;
  hoverSource.value = 'preset';
};

// TODO: handle this
const onPresetSubmit = (nextValue: DateType) => {
  const nextCalendarValues = multiple.value ? toggleDates?.value?.(calendarValue.value, nextValue) : [nextValue];
  const passed = triggerSubmitChange(nextCalendarValues);

  if (passed && !multiple.value) {
    triggerOpen(false, { force: true });
  }
};

const onNow = (now: DateType) => {
  onPresetSubmit(now);
};

// ======================== Panel =========================
const onPanelHover = (date: DateType | null) => {
  internalHoverValue.value = date;
  hoverSource.value = 'cell';
};

// >>> Focus
const onPanelFocus = (event: FocusEvent) => {
  triggerOpen(true);
  onSharedFocus(event);
};

// >>> Calendar
const onPanelSelect = (date: DateType) => {
  lastOperation('panel');

  // Not change values if multiple and value panel is to match with picker
  if (multiple.value && internalMode.value !== picker.value) {
    return;
  }

  const nextValues = multiple.value ? toggleDates?.value?.(calendarValue.value, date) : [date];

  // Only trigger calendar event but not update internal `calendarValue` state
  triggerCalendarChange(nextValues);

  // >>> Trigger next active if !needConfirm
  // Fully logic check `useRangeValue` hook
  if (!needConfirm.value && !complexPicker.value && internalPicker.value === internalMode.value) {
    triggerConfirm();
  }
};

// >>> Close
const onPopupClose = () => {
  // Close popup
  triggerOpen(false);
};

// >>> cellRender
const onInternalCellRender = useCellRender(cellRender);

// >>> invalid

const panelProps = computed(() => {
  const domProps = pickAttrs(filledProps.value, false);
  const restProps = omit(filledProps.value, [
    ...(Object.keys(domProps) as (keyof SharedHTMLAttrs)[]),
    'onChange',
    'onCalendarChange',
    'style',
    'class',
    'onPanelChange',
    'classNames',
    'styles',
  ]);
  return {
    ...restProps,
    multiple: filledProps.value.multiple,
  } as unknown as PopupProps;
});
// >>> Render
const panel = () => (
  <Popup
    // MISC
    {...omit(panelProps.value, ['onSubmit'])}
    showNow={mergedShowNow.value}
    showTime={showTime.value}
    // Disabled
    disabledDate={disabledDate.value}
    // Focus
    onFocus={onPanelFocus}
    onBlur={onSharedBlur}
    // Mode
    picker={picker.value}
    mode={mergedMode.value}
    internalMode={internalMode.value}
    onPanelChange={triggerModeChange}
    // Value
    format={maskFormat.value}
    value={calendarValue.value}
    isInvalid={isInvalidateDate.value as any}
    onChange={null}
    onSelect={onPanelSelect}
    // PickerValue
    pickerValue={currentPickerValue.value}
    defaultOpenValue={showTime?.value?.defaultOpenValue}
    onPickerValueChange={setCurrentPickerValue}
    // Hover
    hoverValue={hoverValues.value}
    onHover={onPanelHover}
    // Submit
    needConfirm={needConfirm.value}
    onSubmit={triggerConfirm}
    onOk={triggerOk}
    // Preset
    presets={presetList.value}
    onPresetHover={onPresetHover}
    onPresetSubmit={onPresetSubmit}
    onNow={onNow}
    // Render
    cellRender={onInternalCellRender.value}
  />
);

// ========================================================
// ==                      Selector                      ==
// ========================================================

// ======================== Change ========================
const onSelectorChange = (date) => {
  triggerCalendarChange(date);
};

const onSelectorInputChange = () => {
  lastOperation('input');
};

// ======================= Selector =======================
const onSelectorFocus: SelectorProps['onFocus'] = (event) => {
  lastOperation('input');

  triggerOpen(true, {
    inherit: true,
  });
  // setActiveIndex(index);

  onSharedFocus(event);
};

const onSelectorBlur: SelectorProps['onBlur'] = (event) => {
  triggerOpen(false);

  onSharedBlur(event);
};

const onSelectorKeyDown: SelectorProps['onKeydown'] = (event) => {
  if (event.key === 'Tab') {
    triggerConfirm();
  }

  onKeydown?.value?.(event);
};

// ======================= Context ========================
const context = computed(() => ({
  prefixCls: prefixCls.value,
  locale: locale.value,
  generateConfig: generateConfig.value,
  button: components?.value?.button,
  input: components?.value?.input,
  classNames: mergedClassNames.value,
  styles: mergedStyles.value,
}));

// ======================== Effect ========================
// >>> Mode
// Reset for every active
watch(
  [mergedOpen, activeIndex, picker],
  async () => {
    await nextTick();
    if (mergedOpen.value && activeIndex.value !== undefined) {
      // Legacy compatible. This effect update should not trigger `onPanelChange`
      triggerModeChange(null, picker.value, false);
    }
  },
  { immediate: true, flush: 'post' },
);

// >>> For complex picker, we need check if need to focus next one
watch(
  mergedOpen,
  async () => {
    await nextTick();
    const lastOp = lastOperation();
    // Trade as confirm on field leave
    if (!mergedOpen.value && lastOp === 'input') {
      triggerOpen(false);
      triggerConfirm();
    }

    // Submit with complex picker
    if (!mergedOpen.value && complexPicker.value && !needConfirm.value && lastOp === 'panel') {
      triggerConfirm();
    }
  },
  { immediate: true, flush: 'post' },
);
</script>

<template>
  <PickerContextProvider :value="context">
    <PickerTrigger
      v-bind="pickTriggerProps(filledProps)"
      :popup-element="panel"
      :popup-style="mergedStyles?.popup?.root"
      :popup-class-name="clsx(rootClassName, mergedClassNames.popup.root)"
      :visible="mergedOpen"
      @close="onPopupClose"
    >
      <SingleSelector
        v-bind="{ ...omit(filledProps, ['onChange', 'onOpenChange']) }"
        ref="selectorRef"
        :class="clsx(filledProps.class, rootClassName, mergedClassNames.root)"
        :style="{
          ...mergedStyles.root,
          ...filledProps.style as any,
        }"
        :suffix-icon="suffixIcon"
        :remove-icon="removeIcon"
        :active-help="!!internalHoverValue"
        :all-help="!!internalHoverValue && hoverSource === 'preset'"
        :focused="focused"
        @focus="onSelectorFocus"
        @blur="onSelectorBlur"
        @keydown="onSelectorKeyDown"
        @submit="triggerConfirm"
        :value="selectorValues"
        :mask-format="maskFormat"
        @change="onSelectorChange"
        @input-change="onSelectorInputChange"
        :internal-picker="internalPicker"
        :format="formatList"
        :input-read-only="inputReadOnly"
        :disabled="disabled"
        :open="mergedOpen"
        @open-change="triggerOpen"
        @click="onSelectorClick"
        @clear="onSelectorClear"
        :invalid="submitInvalidate"
        @invalid="
          (invalid) => {
            // Only `single` mode support type date.
            // `multiple` mode can not typing.
            onSelectorInvalid(invalid, 0);
          }
        "
      />
    </PickerTrigger>
  </PickerContextProvider>
</template>
