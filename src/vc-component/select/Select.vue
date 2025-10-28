<script lang="tsx" setup>
import { isValidNode } from '@/vc-util/Children/util';
import useControlledState from '@/vc-util/hooks/useControlledState';
import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import { isEmpty } from 'lodash-es';
import { computed, ref, toRefs, useId, useSlots, watch, type VNode } from 'vue';
import BaseSelect from './BaseSelect/index.vue';
import { isMultiple, type BaseSelectProps } from './BaseSelect/interface';
import useCache from './hooks/useCache';
import useFilterOptions from './hooks/useFilterOptions';
import useOptions from './hooks/useOptions';
import useRefFunc from './hooks/useRefFunc';
import type {
  DefaultOptionType,
  DisplayInfoType,
  DisplayValueType,
  DraftValueType,
  LabelInValueType,
  OnActiveValue,
  OnInternalSelect,
  RawValueType,
  SelectProps,
} from './interface';
import OptionList from './OptionList.vue';
import { SelectContextProvider, type SelectContextProps } from './SelectContext';
import { hasValue, isComboNoValue, toArray } from './utils/commonUtil';
import { fillFieldNames, flattenOptions, injectPropsWithOption } from './utils/valueUtil';

defineOptions({ name: 'VcSelect', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  mode,
  prefixCls = 'rc-select',
  backfill,
  fieldNames,
  // Search
  showSearch = {},

  // Select
  onSelect,
  onDeselect,
  onActive,
  popupMatchSelectWidth = true,
  optionLabelProp,
  options,
  optionRender,
  defaultActiveFirstOption,
  menuItemSelectedIcon,
  virtual = true,
  direction,
  listHeight = 200,
  listItemHeight = 20,
  labelRender,
  // Value
  labelInValue,
  onChange,
  maxCount,
  classNames,
  styles,
  ...restProps
} = defineProps<SelectProps<any, DefaultOptionType>>();

const open = defineModel('open', { default: false });

const {
  filterOption,
  searchValue,
  autoClearSearchValue = ref(true),
  optionFilterProp = ref('value'),
  filterSort,
  onSearch,
} = toRefs(reactiveComputed(() => (typeof showSearch === 'boolean' && showSearch === true ? {} : showSearch || {})));

const mergedId = useId();
const multiple = computed(() => isMultiple(mode));
const slots = useSlots();
const childrenAsData = computed(() => !!(!options && slots.default?.()));

const mergedFilterOption = computed(() => {
  if (filterOption?.value === undefined && mode === 'combobox') {
    return false;
  }
  return filterOption?.value;
});

// ========================= FieldNames =========================
const mergedFieldNames = computed(() => fillFieldNames(fieldNames, childrenAsData.value));

// =========================== Search ===========================
const [internalSearchValue, setSearchValue] = useControlledState('', searchValue);
const mergedSearchValue = computed(() => internalSearchValue.value || '');

// =========================== Option ===========================
const parsedOptions = useOptions(
  computed(() => options),
  computed(() => slots.default),
  mergedFieldNames,
  optionFilterProp,
  computed(() => optionLabelProp),
);
// ========================= Wrap Value =========================
function isRawValue(value: DraftValueType): value is RawValueType {
  return !value || typeof value !== 'object';
}
const convert2LabelValues = (draftValues: DraftValueType) => {
  // Convert to array
  const valueList = toArray(draftValues);

  // Convert to labelInValue type
  return valueList.map((val) => {
    let rawValue: RawValueType;
    let rawLabel: VNode;
    let rawDisabled: boolean | undefined;
    let rawTitle: string;

    // Fill label & value
    if (isRawValue(val)) {
      rawValue = val;
    } else {
      rawLabel = val.label as VNode;
      rawValue = val.value;
    }

    const option = parsedOptions.value.valueOptions?.get(rawValue);
    if (option) {
      // Fill missing props
      if (rawLabel === undefined) rawLabel = option?.[optionLabelProp || mergedFieldNames.value.label];
      rawDisabled = option?.disabled;
      rawTitle = option?.title;

      // Warning if label not same as provided
      if (process.env.NODE_ENV !== 'production' && !optionLabelProp) {
        const optionLabel = option?.[mergedFieldNames.value.label];
        if (optionLabel !== undefined && !isValidNode(optionLabel) && !isValidNode(rawLabel) && optionLabel !== rawLabel) {
          warning(false, '`label` of `value` is not same as `label` in Select options.');
        }
      }
    }

    return {
      label: rawLabel,
      value: rawValue,
      key: rawValue,
      disabled: rawDisabled,
      title: rawTitle,
    };
  });
};

// =========================== Values ===========================
const internalValue = defineModel('value');

// Merged value with LabelValueType
const rawLabeledValues = computed(() => {
  const newInternalValue = multiple.value && internalValue.value === null ? [] : internalValue.value;
  const values = convert2LabelValues(newInternalValue);

  // combobox no need save value when it's no value (exclude value equal 0)
  if (mode === 'combobox' && isComboNoValue(values[0]?.value)) {
    return [];
  }

  return values;
});

// Fill label with cache to avoid option remove
const [mergedValues, getMixedOption] = useCache(
  rawLabeledValues,
  computed(() => parsedOptions.value?.valueOptions),
);

const displayValues = computed(() => {
  // `null` need show as placeholder instead
  // https://github.com/ant-design/ant-design/issues/25057
  if (!mode && mergedValues.value.length === 1) {
    const firstValue = mergedValues.value[0];
    if (firstValue.value === null && (firstValue.label === null || firstValue.label === undefined)) {
      return [];
    }
  }

  return mergedValues.value.map((item) => ({
    ...item,
    label: (typeof labelRender === 'function' ? labelRender(item) : item.label) ?? item.value,
  }));
});

/** Convert `displayValues` to raw value type set */
const rawValues = computed(() => new Set(mergedValues.value?.map((val) => val.value)));

watch(
  mergedValues,
  () => {
    if (mode === 'combobox') {
      const strValue = mergedValues.value[0]?.value;
      setSearchValue(hasValue(strValue) ? String(strValue) : '');
    }
  },
  { deep: true, immediate: true },
);

// ======================= Display Option =======================
// Create a placeholder item if not exist in `options`
const createTagOption = computed(() =>
  useRefFunc((val: RawValueType, label?: VNode) => {
    const mergedLabel = label ?? val;
    return {
      [mergedFieldNames.value.value]: val,
      [mergedFieldNames.value.label]: mergedLabel,
    } as DefaultOptionType;
  }),
);

// Fill tag as option if mode is `tags`
const filledTagOptions = computed(() => {
  if (mode !== 'tags') {
    return parsedOptions.value.options;
  }

  // >>> Tag mode
  const cloneOptions = [...parsedOptions.value.options];

  // Check if value exist in options (include new patch item)
  const existOptions = (val: RawValueType) => parsedOptions.value.valueOptions.has(val);

  // Fill current value as option
  [...mergedValues.value]
    .sort((a, b) => (a.value < b.value ? -1 : 1))
    .forEach((item) => {
      const val = item.value;

      if (!existOptions(val)) {
        cloneOptions.push(createTagOption.value(val, item.label as any));
      }
    });
  return cloneOptions;
});

const filteredOptions = useFilterOptions(
  filledTagOptions,
  mergedFieldNames,
  mergedSearchValue,
  mergedFilterOption,
  optionFilterProp,
);

// Fill options with search value if needed
const filledSearchOptions = computed(() => {
  if (
    mode !== 'tags' ||
    !mergedSearchValue.value ||
    filteredOptions.value.some((item) => item[optionFilterProp?.value] === mergedSearchValue.value)
  ) {
    return filteredOptions.value;
  }
  // ignore when search value equal select input value
  if (filteredOptions.value.some((item) => item[mergedFieldNames.value.value] === mergedSearchValue.value)) {
    return filteredOptions.value;
  }
  // Fill search value as option
  return [createTagOption.value(mergedSearchValue.value), ...filteredOptions.value];
});

const sorter = (inputOptions: DefaultOptionType[]) => {
  const sortedOptions = [...inputOptions].sort((a, b) => filterSort?.value(a, b, { searchValue: mergedSearchValue.value }));
  return sortedOptions.map((item) => {
    if (Array.isArray(item.options)) {
      return {
        ...item,
        options: item.options.length > 0 ? sorter(item.options) : item.options,
      };
    }
    return item;
  });
};
const orderedFilteredOptions = computed(() => {
  // eslint-disable-next-line no-unused-expressions
  mergedSearchValue.value;
  if (!filterSort?.value) {
    return filledSearchOptions.value;
  }

  return sorter(filledSearchOptions.value);
});

const displayOptions = computed(() =>
  flattenOptions(orderedFilteredOptions.value, {
    fieldNames: mergedFieldNames.value,
    childrenAsData: childrenAsData.value,
  }),
);

// =========================== Change ===========================
const triggerChange = (values: DraftValueType) => {
  const labeledValues = convert2LabelValues(values);

  if (
    // Trigger event only when value changed
    labeledValues.length !== mergedValues.value.length ||
    labeledValues.some((newVal, index) => mergedValues.value[index]?.value !== newVal?.value)
  ) {
    const returnValues = labelInValue
      ? labeledValues.map(({ label: l, value: v }) => ({ label: l, value: v }))
      : labeledValues.map((v) => v.value);

    const returnOptions = labeledValues.map((v) => injectPropsWithOption(getMixedOption(v.value)));
    internalValue.value = multiple.value ? returnValues : returnValues[0];

    onChange?.(
      // Value
      multiple.value ? returnValues : returnValues[0],
      // Option
      multiple.value ? returnOptions : returnOptions[0],
    );
  }
};

// ======================= Accessibility ========================
const activeValue = ref<string>(null);
const accessibilityIndex = ref(0);
const mergedDefaultActiveFirstOption = computed(() =>
  defaultActiveFirstOption !== undefined ? defaultActiveFirstOption : mode !== 'combobox',
);

const activeEventRef = ref<Promise<void>>();

const onActiveValue: OnActiveValue = (active, index, { source = 'keyboard' } = {}) => {
  accessibilityIndex.value = index;

  if (backfill && mode === 'combobox' && active !== null && source === 'keyboard') {
    activeValue.value = String(active);
  }

  // Active will call multiple times.
  // We only need trigger the last one.
  const promise = Promise.resolve().then(() => {
    if (activeEventRef.value === promise) {
      onActive?.(active);
    }
  });
  activeEventRef.value = promise;
};

// ========================= OptionList =========================
const triggerSelect = (val: RawValueType, selected: boolean, type?: DisplayInfoType) => {
  const getSelectEnt = (): [RawValueType | LabelInValueType, DefaultOptionType] => {
    const option = getMixedOption(val);
    return [
      labelInValue
        ? {
            label: option?.[mergedFieldNames.value.label],
            value: val,
          }
        : val,
      injectPropsWithOption(option),
    ];
  };

  if (selected && onSelect) {
    const [wrappedValue, option] = getSelectEnt();
    onSelect(wrappedValue, option);
  } else if (!selected && onDeselect && type !== 'clear') {
    const [wrappedValue, option] = getSelectEnt();
    onDeselect(wrappedValue, option);
  }
};

// Used for OptionList selection
const onInternalSelect = useRefFunc<OnInternalSelect>((val, info) => {
  let cloneValues: (RawValueType | DisplayValueType)[];

  // Single mode always trigger select only with option list
  const mergedSelect = multiple.value ? info.selected : true;

  if (mergedSelect) {
    cloneValues = multiple.value ? [...mergedValues.value, val] : [val];
  } else {
    cloneValues = mergedValues.value.filter((v) => v.value !== val);
  }

  triggerChange(cloneValues);
  triggerSelect(val, mergedSelect);

  // Clean search value if single or configured
  if (mode === 'combobox') {
    activeValue.value = '';
  } else if (!isMultiple || autoClearSearchValue?.value) {
    setSearchValue('');
    activeValue.value = '';
  }
});

// ======================= Display Change =======================
// BaseSelect display values change
const onDisplayValuesChange: BaseSelectProps['onDisplayValuesChange'] = (nextValues, info) => {
  triggerChange(nextValues);
  const { type, values } = info;

  if (type === 'remove' || type === 'clear') {
    values.forEach((item) => {
      triggerSelect(item.value, false, type);
    });
  }
};

// =========================== Search ===========================
const onInternalSearch: BaseSelectProps['onSearch'] = (searchText, info) => {
  setSearchValue(searchText);
  activeValue.value = null;

  // [Submit] Tag mode should flush input
  if (info.source === 'submit') {
    const formatted = (searchText || '').trim();
    // prevent empty tags from appearing when you click the Enter button
    if (formatted) {
      const newRawValues = Array.from(new Set<RawValueType>([...rawValues.value, formatted]));
      triggerChange(newRawValues);
      triggerSelect(formatted, true);
      setSearchValue('');
    }

    return;
  }

  if (info.source !== 'blur') {
    if (mode === 'combobox') {
      triggerChange(searchText);
    }

    onSearch?.value?.(searchText);
  }
};

const onInternalSearchSplit: BaseSelectProps['onSearchSplit'] = (words) => {
  let patchValues: RawValueType[] = words;

  if (mode !== 'tags') {
    patchValues = words
      .map((word) => {
        const opt = parsedOptions?.value?.labelOptions.get(word as unknown as VNode);
        return opt?.value;
      })
      .filter((val) => val !== undefined);
  }

  const newRawValues = Array.from(new Set<RawValueType>([...rawValues.value, ...patchValues]));
  triggerChange(newRawValues);
  newRawValues.forEach((newRawValue) => {
    triggerSelect(newRawValue, true);
  });
};

// ========================== Context ===========================
const selectContext = computed((): SelectContextProps => {
  const realVirtual = virtual && popupMatchSelectWidth !== false;
  return {
    ...parsedOptions.value,
    flattenOptions: displayOptions.value,
    onActiveValue,
    defaultActiveFirstOption: mergedDefaultActiveFirstOption.value,
    onSelect: onInternalSelect,
    menuItemSelectedIcon,
    rawValues: rawValues.value,
    fieldNames: mergedFieldNames.value,
    virtual: realVirtual,
    direction,
    listHeight,
    listItemHeight,
    childrenAsData: childrenAsData.value,
    maxCount,
    optionRender,
    classNames,
    styles,
  };
});
const OMIT_DOM_PROPS = ['inputValue'];
</script>
<template>
  <SelectContextProvider :value="selectContext">
    <BaseSelect
      v-bind="{ ...restProps, ...$attrs }"
      v-model:open="open"
      show-scroll-bar="optional"
      :id="mergedId"
      :prefix-cls="prefixCls"
      :omit-dom-props="OMIT_DOM_PROPS"
      :mode="mode"
      :class-names="classNames"
      :styles="styles"
      :display-values="displayValues"
      @display-values-change="onDisplayValuesChange"
      :max-count="maxCount"
      :direction="direction"
      :show-search="(typeof showSearch === 'boolean' && showSearch === true) || !isEmpty(showSearch) || multiple"
      :search-value="mergedSearchValue"
      @search="onInternalSearch"
      :auto-clear-search-value="!!autoClearSearchValue"
      @search-split="onInternalSearchSplit"
      :popup-match-select-width="popupMatchSelectWidth"
      :-option-list="OptionList"
      :empty-options="!displayOptions.length"
      :active-value="activeValue"
      :active-descendant-id="`${mergedId}_list_${accessibilityIndex}`"
    />
  </SelectContextProvider>
</template>
