<script lang="tsx" setup generic="DateType extends object = any">
import useMergedState from '@/vc-util/hooks/useMergedState';
import pickAttrs from '@/vc-util/pickAttrs';
import { reactiveComputed, toReactive } from '@vueuse/core';
import { omit } from 'lodash-es';
import { computed, nextTick, ref, toRefs, watch } from 'vue';
import useSemantic from '../hooks/useSemantic';
import type {
  BaseInfo,
  InternalMode,
  OnOpenChange,
  OpenConfig,
  PanelMode,
  RangeTimeProps,
  SelectorProps,
  SharedHTMLAttrs,
  SharedPickerProps,
  ValueDate,
} from '../interface';
import { fillIndex, getFromDate, toArray } from '../utils/miscUtil';
import useCellRender from './hooks/useCellRender';
import useFieldsInvalidate from './hooks/useFieldsInvalidate';
import useFilledProps, { type FilledProps } from './hooks/useFilledProps';
import useOpen from './hooks/useOpen';
import usePresets from './hooks/usePresets';
import useRangeActive from './hooks/useRangeActive';
import useRangeDisabledDate from './hooks/useRangeDisabledDate';
import useRangePickerValue from './hooks/useRangePickerValue';
import useRangeValue, { useInnerValue } from './hooks/useRangeValue';
import useShowNow from './hooks/useShowNow';
import type { PopupShowTimeConfig } from './Popup/index.vue';
import RangeSelector, { type SelectorIdType } from './Selector/RangeSelector.vue';
import Popup from './Popup/index.vue';
import warning from '@/vc-util/warning';
import { PickerContextProvider } from './context';
import PickerTrigger from '../PickerTrigger/index.vue';
import { pickTriggerProps } from '../PickerTrigger/util';
import clsx from 'clsx';

export type RangeValueType<DateType> = [start: DateType | null | undefined, end: DateType | null | undefined];

/** Used for change event, it should always be not undefined */
export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null];

export interface BaseRangePickerProps<DateType extends object> extends Omit<SharedPickerProps<DateType>, 'showTime' | 'id'> {
  // Structure
  id?: SelectorIdType;

  separator?: any;

  // Value
  value?: RangeValueType<DateType> | null;
  defaultValue?: RangeValueType<DateType>;
  onChange?: (dates: NoUndefinedRangeValueType<DateType> | null, dateStrings: [string, string]) => void;
  onCalendarChange?: (dates: NoUndefinedRangeValueType<DateType>, dateStrings: [string, string], info: BaseInfo) => void;
  onOk?: (values: NoUndefinedRangeValueType<DateType>) => void;

  // Placeholder
  placeholder?: [string, string];

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: [DateType, DateType] | DateType | null;
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: [DateType, DateType] | DateType | null;
  /**
   * Each popup panel `pickerValue` includes `mode` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing
   * @param info.mode Next `mode` panel
   */
  onPickerValueChange?: (
    date: [DateType, DateType],
    info: BaseInfo & {
      source: 'reset' | 'panel';
      mode: [PanelMode, PanelMode];
    },
  ) => void;

  // Preset
  presets?: ValueDate<Exclude<RangeValueType<DateType>, null>>[];
  /** @deprecated Please use `presets` instead */
  ranges?: Record<string, Exclude<RangeValueType<DateType>, null> | (() => Exclude<RangeValueType<DateType>, null>)>;

  // Control
  disabled?: boolean | [boolean, boolean];
  allowEmpty?: boolean | [boolean, boolean];

  // Time
  showTime?: boolean | RangeTimeProps<DateType>;

  // Mode
  mode?: [startMode: PanelMode, endMode: PanelMode];
  /** Trigger on each `mode` or `pickerValue` changed. */
  onPanelChange?: (values: NoUndefinedRangeValueType<DateType>, modes: [startMode: PanelMode, endMode: PanelMode]) => void;
}

export interface RangePickerProps<DateType extends object>
  extends BaseRangePickerProps<DateType>,
    Omit<RangeTimeProps<DateType>, 'format' | 'defaultOpenValue'> {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = withDefaults(defineProps<RangePickerProps<DateType>>(), {
  allowClear: true,
  showNow: false,
  showHour: true,
  showMinute: true,
  showSecond: true,
  picker: 'date',
  prefixCls: 'rc-picker',
  order: true,
  styles: () => ({}),
  classNames: () => ({}),
  components: () => ({}),
});

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

function getActiveRange(activeIndex: number) {
  return activeIndex === 1 ? 'end' : 'start';
}

const updateProps = () => {
  const { disabled, allowEmpty } = props;

  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, false);

  return {
    disabled: mergedDisabled,
    allowEmpty: mergedAllowEmpty,
  };
};

// ========================= Prop =========================
const [filledProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate] = useFilledProps(
  toReactive(props),
  updateProps,
);

const {
  // Style
  prefixCls,
  rootClassName,
  styles: propStyles,
  classNames: propClassNames,

  // Value
  defaultValue,
  value,
  needConfirm,
  onKeydown,

  // Disabled
  disabled,
  allowEmpty,
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

  // Picker Value
  defaultPickerValue,
  pickerValue,
  onPickerValueChange,

  // Format
  inputReadOnly,

  suffixIcon,

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
} = toRefs(toReactive(filledProps) as FilledProps<RangePickerProps<DateType>, DateType, ReturnType<typeof updateProps>>);
const selectorRef = ref();

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

const { mergedClassNames, mergedStyles } = toRefs(reactiveComputed(() => useSemantic(propClassNames.value, propStyles.value)));

// ========================= Open =========================
const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, disabled, onOpenChange.value);

const triggerOpen: OnOpenChange = (nextOpen, config?: OpenConfig) => {
  // No need to open if all disabled
  if (disabled.value.some((fieldDisabled) => !fieldDisabled) || !nextOpen) {
    setMergeOpen(nextOpen, config);
  }
};

// ======================== Values ========================
const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, triggerOk] = useInnerValue(
  generateConfig,
  locale,
  formatList,
  computed(() => true),
  computed(() => false),
  defaultValue,
  value,
  onCalendarChange.value as any,
  onOk.value,
);

const calendarValue = computed(() => getCalendarValue());

// ======================== Active ========================
const [
  focused,
  triggerFocus,
  lastOperation,
  activeIndex,
  nextActiveIndex,
  activeIndexList,
  updateSubmitIndex,
  hasActiveSubmitValue,
] = useRangeActive(disabled, allowEmpty, mergedOpen);

const onSharedFocus = (event: FocusEvent, index?: number) => {
  triggerFocus(true);

  onFocus?.value?.(event, {
    range: getActiveRange(index ?? activeIndex.value),
  });
};

const onSharedBlur = (event: FocusEvent, index?: number) => {
  triggerFocus(false);

  onBlur?.value?.(event, {
    range: getActiveRange(index ?? activeIndex.value),
  });
};

// ======================= ShowTime =======================
/** Used for Popup panel */
const mergedShowTime = computed<PopupShowTimeConfig<DateType> & Pick<RangeTimeProps<DateType>, 'defaultOpenValue'>>(() => {
  if (!showTime.value) {
    return null;
  }

  const { disabledTime } = showTime.value;

  const proxyDisabledTime = disabledTime
    ? (date: DateType) => {
        const range = getActiveRange(activeIndex.value);
        const fromDate = getFromDate(calendarValue.value, activeIndexList.value, activeIndex.value);
        return disabledTime(date, range, {
          from: fromDate,
        });
      }
    : undefined;

  return { ...showTime.value, disabledTime: proxyDisabledTime };
});

// ========================= Mode =========================
const [modes, setModes] = useMergedState<[PanelMode, PanelMode]>([picker.value, picker.value], {
  defaultValue: mode.value as any,
});

const mergedMode = computed(() => modes.value[activeIndex.value] || picker.value);

/** Extends from `mergedMode` to patch `datetime` mode */
const internalMode = computed<InternalMode>(() =>
  mergedMode.value === 'date' && mergedShowTime.value ? 'datetime' : mergedMode.value,
);

// ====================== PanelCount ======================
const multiplePanel = computed(() => internalMode.value === picker.value && internalMode.value !== 'time');

// ======================= Show Now =======================
const mergedShowNow = computed(() => useShowNow(picker.value, mergedMode.value, showNow.value, true));

// ======================== Value =========================
const [flushSubmit, triggerSubmitChange] = useRangeValue<any>(
  filledProps as any,
  mergedValue,
  setInnerValue,
  calendarValue,
  triggerCalendarChange,
  disabled as any,
  formatList,
  focused,
  mergedOpen,
  isInvalidateDate,
);

// ===================== DisabledDate =====================
const mergedDisabledDate = computed(() =>
  useRangeDisabledDate(
    calendarValue.value,
    disabled.value,
    activeIndexList.value,
    generateConfig.value,
    locale.value,
    disabledDate.value,
  ),
);

// ======================= Validate =======================
const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate<any, any>(calendarValue, isInvalidateDate, allowEmpty);

// ===================== Picker Value =====================
const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
  generateConfig,
  locale,
  calendarValue,
  modes,
  mergedOpen,
  activeIndex,
  internalPicker,
  multiplePanel,
  defaultPickerValue,
  pickerValue,
  computed(() => mergedShowTime.value?.defaultOpenValue),
  onPickerValueChange.value as any,
  minDate,
  maxDate,
);

// >>> Mode need wait for `pickerValue`
const triggerModeChange = (nextPickerValue: DateType, nextMode: PanelMode, triggerEvent?: boolean) => {
  const clone = fillIndex(modes.value, activeIndex.value, nextMode);

  if (clone[0] !== modes.value[0] || clone[1] !== modes.value[1]) {
    setModes(clone);
  }

  // Compatible with `onPanelChange`
  if (onPanelChange.value && triggerEvent !== false) {
    const clonePickerValue: RangeValueType<DateType> = [...calendarValue.value];
    if (nextPickerValue) {
      clonePickerValue[activeIndex.value] = nextPickerValue;
    }
    onPanelChange.value(clonePickerValue, clone);
  }
};

// ======================== Change ========================
const fillCalendarValue = (date: DateType, index: number) =>
  // Trigger change only when date changed
  fillIndex(calendarValue.value, index, date);

// ======================== Submit ========================
/**
 * Trigger by confirm operation.
 * This function has already handle the `needConfirm` check logic.
 * - Selector: enter key
 * - Panel: OK button
 */
const triggerPartConfirm = (date?: DateType, skipFocus?: boolean) => {
  let nextValue = calendarValue.value;

  if (date) {
    nextValue = fillCalendarValue(date, activeIndex.value);
  }
  updateSubmitIndex(activeIndex.value);
  // Get next focus index
  const nextIndex = nextActiveIndex(nextValue);

  // Change calendar value and tell flush it
  triggerCalendarChange(nextValue);
  flushSubmit(activeIndex.value, nextIndex === null);

  if (nextIndex === null) {
    triggerOpen(false, { force: true });
  } else if (!skipFocus) {
    selectorRef.value.focus({ index: nextIndex });
  }
};

// ======================== Click =========================
const onSelectorClick = (event: MouseEvent) => {
  const rootNode = (event.target as HTMLElement).getRootNode();
  if (!selectorRef.value.nativeElement.contains((rootNode as Document | ShadowRoot).activeElement ?? document.activeElement)) {
    // Click to focus the enabled input
    const enabledIndex = disabled.value?.findIndex((d) => !d);
    if (enabledIndex >= 0) {
      selectorRef.value.focus({ index: enabledIndex });
    }
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
const internalHoverValues = ref<RangeValueType<DateType>>(null);

const hoverValues = computed(() => {
  return internalHoverValues.value || calendarValue.value;
});

// Clean up `internalHoverValues` when closed
watch(
  mergedOpen,
  () => {
    if (!mergedOpen.value) {
      internalHoverValues.value = null;
    }
  },
  { immediate: true },
);

// ========================================================
// ==                       Panels                       ==
// ========================================================
// Save the offset with active bar position
const activeInfo = ref<[activeInputLeft: number, activeInputRight: number, selectorWidth: number]>([0, 0, 0]);

// ======================= Presets ========================
const presetList = usePresets(presets);

const onPresetHover = (nextValues: RangeValueType<DateType> | null) => {
  internalHoverValues.value = nextValues;
  hoverSource.value = 'preset';
};

const onPresetSubmit = (nextValues: RangeValueType<DateType>) => {
  const passed = triggerSubmitChange(nextValues);

  if (passed) {
    triggerOpen(false, { force: true });
  }
};

const onNow = (now: DateType) => {
  triggerPartConfirm(now);
};

// ======================== Panel =========================
const onPanelHover = (date: DateType) => {
  internalHoverValues.value = date ? fillCalendarValue(date, activeIndex.value) : null;
  hoverSource.value = 'cell';
};

// >>> Focus
const onPanelFocus = (event) => {
  triggerOpen(true);
  onSharedFocus(event);
};

// >>> MouseDown
const onPanelMouseDown = () => {
  lastOperation('panel');
};

// >>> Calendar
const onPanelSelect = (date: DateType) => {
  const clone: RangeValueType<DateType> = fillIndex(calendarValue.value, activeIndex.value, date);

  // Only trigger calendar event but not update internal `calendarValue` state
  triggerCalendarChange(clone);

  // >>> Trigger next active if !needConfirm
  // Fully logic check `useRangeValue` hook
  if (!needConfirm.value && !complexPicker.value && internalPicker.value === internalMode.value) {
    triggerPartConfirm(date);
  }
};

// >>> Close
const onPopupClose = () => {
  // Close popup
  triggerOpen(false);
};

// >>> cellRender
const onInternalCellRender = useCellRender(
  cellRender,
  computed(() => getActiveRange(activeIndex.value)),
);

// >>> Value
const panelValue = computed(() => calendarValue.value[activeIndex.value] || null);

// >>> invalid
const isPopupInvalidateDate = (date) => {
  return isInvalidateDate?.value?.(date, {
    activeIndex: activeIndex.value,
  });
};

const panelProps = computed(() => {
  const domProps = pickAttrs(filledProps.value, false);
  const restProps = omit(filledProps.value, [
    ...(Object.keys(domProps) as (keyof SharedHTMLAttrs)[]),
    'onChange',
    'onCalendarChange',
    'style',
    'class',
    'onPanelChange',
    'disabledTime',
    'classNames',
    'styles',
    'onSubmit',
    'onPickerValueChange',
  ]);
  return restProps;
});

// >>> Render
const panel = () => {
  return (
    <Popup<any>
      // MISC
      {...(panelProps.value as any)}
      showNow={mergedShowNow.value}
      showTime={mergedShowTime.value}
      // Range
      range
      multiplePanel={multiplePanel.value}
      activeInfo={activeInfo.value}
      // Disabled
      disabledDate={mergedDisabledDate.value}
      // Focus
      onFocus={onPanelFocus}
      onBlur={onSharedBlur}
      onPanelMouseDown={onPanelMouseDown}
      // Mode
      picker={picker.value}
      mode={mergedMode.value}
      internalMode={internalMode.value}
      onPanelChange={triggerModeChange}
      // Value
      format={maskFormat.value}
      value={panelValue.value}
      isInvalid={isPopupInvalidateDate}
      onChange={null}
      onSelect={onPanelSelect}
      // PickerValue
      pickerValue={currentPickerValue.value}
      defaultOpenValue={toArray(showTime?.value?.defaultOpenValue)[activeIndex.value]}
      onPickerValueChange={setCurrentPickerValue}
      // Hover
      hoverValue={hoverValues.value}
      onHover={onPanelHover}
      // Submit
      needConfirm={needConfirm.value}
      onSubmit={triggerPartConfirm}
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
};

// ========================================================
// ==                      Selector                      ==
// ========================================================

// ======================== Change ========================
const onSelectorChange = (date: DateType, index: number) => {
  const clone = fillCalendarValue(date, index);

  triggerCalendarChange(clone);
};

const onSelectorInputChange = () => {
  lastOperation('input');
};

// ======================= Selector =======================
const onSelectorFocus: SelectorProps['onFocus'] = (event, index) => {
  // Check if `needConfirm` but user not submit yet
  const activeListLen = activeIndexList.value.length;
  const lastActiveIndex = activeIndexList.value[activeListLen - 1];
  if (
    activeListLen &&
    lastActiveIndex !== index &&
    needConfirm.value &&
    // Not change index if is not filled
    !allowEmpty.value[lastActiveIndex] &&
    !hasActiveSubmitValue(lastActiveIndex) &&
    calendarValue.value[lastActiveIndex]
  ) {
    selectorRef.value.focus({ index: lastActiveIndex });
    return;
  }

  lastOperation('input');

  triggerOpen(true, {
    inherit: true,
  });

  // When click input to switch the field, it will not trigger close.
  // Which means it will lose the part confirm and we need fill back.
  // ref: https://github.com/ant-design/ant-design/issues/49512
  if (activeIndex.value !== index && mergedOpen.value && !needConfirm.value && complexPicker.value) {
    triggerPartConfirm(null, true);
  }

  activeIndex.value = index;

  onSharedFocus(event, index);
};

const onSelectorBlur: SelectorProps['onBlur'] = (event, index) => {
  triggerOpen(false);
  if (!needConfirm.value && lastOperation() === 'input') {
    const nextIndex = nextActiveIndex(calendarValue.value);
    flushSubmit(activeIndex.value, nextIndex === null);
  }

  onSharedBlur(event, index);
};

const onSelectorKeyDown: SelectorProps['onKeydown'] = (event, preventDefault) => {
  if (event.key === 'Tab') {
    triggerPartConfirm(null, true);
  }

  onKeydown?.value?.(event, preventDefault);
};

// ======================= Context ========================
const context = computed(() => ({
  prefixCls: prefixCls.value,
  locale: locale.value,
  generateConfig: generateConfig.value,
  button: components.value.button,
  input: components.value.input,
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
      triggerPartConfirm(null, true);
    }

    // Submit with complex picker
    if (!mergedOpen.value && complexPicker.value && !needConfirm.value && lastOp === 'panel') {
      triggerOpen(true);
      triggerPartConfirm();
    }
  },
  { immediate: true, flush: 'post' },
);

// ====================== DevWarning ======================
if (process.env.NODE_ENV !== 'production') {
  const isIndexEmpty = (index: number) => {
    return (
      // Value is empty
      !value?.[index] &&
      // DefaultValue is empty
      !defaultValue?.[index]
    );
  };

  if (disabled.value.some((fieldDisabled, index) => fieldDisabled && isIndexEmpty(index) && !allowEmpty[index])) {
    warning(false, '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.');
  }
}
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
      range
    >
      <RangeSelector
        v-bind="{ ...omit(filledProps, ['onChange']) }"
        :ref="(el) => (selectorRef = el)"
        :class="clsx(filledProps.class, rootClassName, mergedClassNames.root)"
        :style="{
          ...mergedStyles.root,
          ...filledProps.style as any,
        }"
        :suffix-icon="suffixIcon"
        :active-index="focused || mergedOpen ? activeIndex : null"
        :active-help="!!internalHoverValues"
        :all-help="!!internalHoverValues && hoverSource === 'preset'"
        :focused="focused"
        @focus="onSelectorFocus"
        @blur="onSelectorBlur"
        @keydown="onSelectorKeyDown"
        @submit="triggerPartConfirm"
        :value="hoverValues"
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
        :invalid="submitInvalidates"
        @invalid="onSelectorInvalid"
        @active-info="(e) => (activeInfo = e)"
      />
    </PickerTrigger>
  </PickerContextProvider>
</template>
