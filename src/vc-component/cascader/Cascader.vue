<script lang="tsx" setup>
import { BaseSelect, type BaseSelectProps, type BaseSelectPropsWithoutPrivate, type BaseSelectRef } from '@/vc-component/select';
import type { DisplayValueType, Placement } from '@/vc-component/select/interface';
import type { BuildInPlacements } from '@/vc-component/trigger';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import useControlledState from '@/vc-util/hooks/useControlledState';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { computed, getCurrentInstance, ref, toRefs, useId, type CSSProperties } from 'vue';
import { CascaderContextProvider } from './context';
import useDisplayValues from './hooks/useDisplayValues';
import useMissingValues from './hooks/useMissingValues';
import useOptions from './hooks/useOptions';
import useSearchConfig from './hooks/useSearchConfig';
import useSearchOptions from './hooks/useSearchOptions';
import useSelect from './hooks/useSelect';
import useValues from './hooks/useValues';
import OptionList from './OptionList/index.vue';
import { fillFieldNames, SHOW_PARENT, toPathKeys, toRawValues, type SHOW_CHILD } from './utils/commonUtil';
import { formatStrategyValues, toPathOptions } from './utils/treeUtil';
import { warningNullOptions } from './utils/warningPropsUtil';

export interface BaseOptionType {
  disabled?: boolean;
  disableCheckbox?: boolean;
  label?: any;
  value?: string | number | null;
  children?: DefaultOptionType[];
}

export type DefaultOptionType = BaseOptionType & Record<string, any>;

export interface SearchConfig<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> {
  filter?: (inputValue: string, options: OptionType[], fieldNames: FieldNames<OptionType, ValueField>) => boolean;
  render?: (inputValue: string, path: OptionType[], prefixCls: string, fieldNames: FieldNames<OptionType, ValueField>) => any;
  sort?: (a: OptionType[], b: OptionType[], inputValue: string, fieldNames: FieldNames<OptionType, ValueField>) => number;
  matchInputWidth?: boolean;
  limit?: number | false;
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
}

export type ShowCheckedStrategy = typeof SHOW_PARENT | typeof SHOW_CHILD;

interface BaseCascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> extends Omit<BaseSelectPropsWithoutPrivate, 'tokenSeparators' | 'placement' | 'labelInValue' | 'mode' | 'showSearch'> {
  // MISC
  id?: string;
  prefixCls?: string;
  fieldNames?: FieldNames<OptionType, ValueField>;
  optionRender?: (option: OptionType) => any;

  // Value
  changeOnSelect?: boolean;
  displayRender?: (label: string[], selectedOptions?: OptionType[]) => any;
  checkable?: boolean | any;
  showCheckedStrategy?: ShowCheckedStrategy;

  showSearch?: boolean | SearchConfig<OptionType>;

  // Trigger
  expandTrigger?: 'hover' | 'click';

  // Options
  options?: OptionType[];
  /** @private Internal usage. Do not use in your production. */
  popupPrefixCls?: string;
  loadData?: (selectOptions: OptionType[]) => void;

  popupClassName?: string;
  popupMenuColumnStyle?: CSSProperties;

  placement?: Placement;
  builtinPlacements?: BuildInPlacements;

  onPopupVisibleChange?: (open: boolean) => void;

  // Icon
  expandIcon?: any;
  loadingIcon?: any;
}

export interface FieldNames<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> {
  label?: keyof OptionType;
  value?: keyof OptionType | ValueField;
  children?: keyof OptionType;
}

export type ValueType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> = keyof OptionType extends ValueField
  ? unknown extends OptionType['value']
    ? OptionType[ValueField]
    : OptionType['value']
  : OptionType[ValueField];

export type GetValueType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | any = false,
> = false extends Multiple ? ValueType<Required<OptionType>, ValueField>[] : ValueType<Required<OptionType>, ValueField>[][];

export type GetOptionType<
  OptionType extends DefaultOptionType = DefaultOptionType,
  Multiple extends boolean | any = false,
> = false extends Multiple ? OptionType[] : OptionType[][];

type SemanticName = 'input' | 'prefix' | 'suffix';
type PopupSemantic = 'list' | 'listItem';
export interface CascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | any = false,
> extends BaseCascaderProps<OptionType, ValueField> {
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  checkable?: boolean | VueNode;
  onChange?: (value: GetValueType<OptionType, ValueField, Multiple>, selectOptions: GetOptionType<OptionType, Multiple>) => void;
}

export type SingleValueType = (string | number)[];

export type LegacyKey = string | number;

export type InternalValueType = SingleValueType | SingleValueType[];

export interface InternalFieldNames extends Required<FieldNames> {
  key: string;
}

export type InternalCascaderProps = Omit<CascaderProps, 'onChange'> & {
  open?: boolean;
  onChange?: (value: InternalValueType, selectOptions: BaseOptionType[] | BaseOptionType[][]) => void;
};

export type CascaderRef = Omit<BaseSelectRef, 'scrollTo'>;

defineOptions({ name: 'Cascader', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // MISC
  id: _,
  prefixCls = 'rc-cascader',
  fieldNames,

  // Value
  changeOnSelect,
  onChange,
  displayRender,
  checkable,

  // Search
  showSearch,

  // Trigger
  expandTrigger,

  // Options
  options,
  popupPrefixCls,
  loadData,

  open,

  popupClassName,
  popupMenuColumnStyle,
  popupStyle: customPopupStyle,

  classNames,
  styles,

  placement,

  onPopupVisibleChange,

  // Icon
  expandIcon = '>',
  loadingIcon,

  // Children
  popupMatchSelectWidth = false,
  showCheckedStrategy = SHOW_PARENT,
  optionRender,
  ...restProps
} = defineProps<InternalCascaderProps>();

const mergedId = useId();
const multiple = computed(() => !!checkable);

// =========================== Values ===========================
const rawValues = defineModel<SingleValueType[]>('value', {
  default: [],
  get(v) {
    return toRawValues(v);
  },
});

// ========================= FieldNames =========================
const mergedFieldNames = computed(() => fillFieldNames(fieldNames));

// =========================== Option ===========================
const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
  mergedFieldNames,
  computed(() => options),
);

const vm = getCurrentInstance();

// =========================== Search ===========================
const { mergedShowSearch, searchConfig } = toRefs(
  useSearchConfig(
    computed(() => showSearch),
    vm.props,
  ),
);
const { searchValue, onSearch } = toRefs(searchConfig.value);
const autoClearSearchValue = computed(() => searchConfig.value.autoClearSearchValue || true);
const [internalSearchValue, setSearchValue] = useControlledState('', searchValue);
const mergedSearchValue = computed(() => internalSearchValue.value || '');

const onInternalSearch: BaseSelectProps['onSearch'] = (searchText, info) => {
  setSearchValue(searchText);
  if (info.source !== 'blur' && onSearch) {
    onSearch.value?.(searchText);
  }
};

const searchOptions = useSearchOptions(
  mergedSearchValue,
  mergedOptions,
  mergedFieldNames,
  computed(() => popupPrefixCls || prefixCls),
  reactiveComputed(() => searchConfig.value),
  computed(() => changeOnSelect || multiple.value),
);

// =========================== Values ===========================
const getMissingValues = computed(() => useMissingValues(mergedOptions.value, mergedFieldNames.value));

// Fill `rawValues` with checked conduction values
const { checkedValues, halfCheckedValues, missingCheckedValues } = toRefs(
  useValues(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues),
);

const deDuplicatedValues = computed(() => {
  const checkedKeys = toPathKeys(checkedValues.value);
  const deduplicateKeys = formatStrategyValues(checkedKeys, getPathKeyEntities, showCheckedStrategy);
  return [...missingCheckedValues.value, ...getValueByKeyPath(deduplicateKeys)];
});

const displayValues = useDisplayValues(deDuplicatedValues, mergedOptions, mergedFieldNames, multiple, displayRender);

// =========================== Change ===========================
const triggerChange = (nextValues: InternalValueType) => {
  // Save perf if no need trigger event
  const nextRawValues = toRawValues(nextValues);

  const valueOptions = nextRawValues.map((valueCells) =>
    toPathOptions(valueCells, mergedOptions.value, mergedFieldNames.value).map((valueOpt) => valueOpt.option),
  );

  const triggerValues = multiple.value ? nextRawValues : nextRawValues[0];
  const triggerOptions = multiple.value ? valueOptions : valueOptions[0];
  rawValues.value = triggerValues as any;
  onChange?.(triggerValues, triggerOptions);
};

// =========================== Select ===========================
const handleSelection = computed(() =>
  useSelect(
    multiple.value,
    triggerChange,
    checkedValues.value,
    halfCheckedValues.value,
    missingCheckedValues.value,
    getPathKeyEntities,
    getValueByKeyPath,
    showCheckedStrategy,
  ),
);

const onInternalSelect = (valuePath: SingleValueType) => {
  if (!multiple.value || autoClearSearchValue.value) {
    setSearchValue('');
  }
  handleSelection.value?.(valuePath);
};

// Display Value change logic
const onDisplayValuesChange: BaseSelectProps['onDisplayValuesChange'] = (_, info) => {
  if (info.type === 'clear') {
    triggerChange([]);
    return;
  }

  // Cascader do not support `add` type. Only support `remove`
  const { valueCells } = info.values[0] as DisplayValueType & { valueCells: SingleValueType };
  onInternalSelect(valueCells);
};

const onInternalPopupVisibleChange = (nextVisible: boolean) => {
  onPopupVisibleChange?.(nextVisible);
};

// ========================== Warning ===========================
if (process.env.NODE_ENV !== 'production') {
  warningNullOptions(mergedOptions.value, mergedFieldNames.value);
}

// ========================== Context ===========================
const cascaderContext = computed(() => ({
  classNames,
  styles,
  options: mergedOptions.value,
  fieldNames: mergedFieldNames.value,
  values: checkedValues.value,
  halfValues: halfCheckedValues.value,
  changeOnSelect,
  onSelect: onInternalSelect,
  checkable,
  searchOptions: searchOptions.value,
  popupPrefixCls,
  loadData,
  expandTrigger,
  expandIcon,
  loadingIcon,
  popupMenuColumnStyle,
  optionRender,
}));

// ==============================================================
// ==                          Render                          ==
// ==============================================================
const emptyOptions = computed(() => !(mergedSearchValue.value ? searchOptions.value : mergedOptions.value).length);

const popupStyle = computed<CSSProperties>(() => {
  return (mergedSearchValue.value && searchConfig.value.matchInputWidth) ||
    // Empty keep the width
    emptyOptions.value
    ? {}
    : {
        minWidth: 'auto',
      };
});
const domRef = ref();
</script>
<template>
  <CascaderContextProvider :value="cascaderContext">
    <BaseSelect
      v-bind="restProps"
      ref="domRef"
      :id="mergedId"
      :prefix-cls="prefixCls"
      :auto-clear-search-value="autoClearSearchValue"
      :popup-match-select-width="popupMatchSelectWidth"
      :class-names="{
        prefix: classNames?.prefix,
        suffix: classNames?.suffix,
        input: classNames?.input,
      }"
      :styles="{
        prefix: styles?.prefix,
        suffix: styles?.suffix,
        input: styles?.input,
      }"
      :popup-style="{
        ...popupStyle,
        ...customPopupStyle,
      }"
      :display-values="displayValues"
      @display-values-change="onDisplayValuesChange"
      :mode="multiple ? 'multiple' : undefined"
      :search-value="mergedSearchValue"
      @search="onInternalSearch"
      :show-search="mergedShowSearch"
      :-option-list="OptionList"
      :empty-options="emptyOptions"
      :open="open"
      :popup-class-name="popupClassName"
      :placement="placement"
      @popup-visible-change="onInternalPopupVisibleChange"
      :get-raw-input-element="() => flattenChildren($slots.default?.())[0]"
    />
  </CascaderContextProvider>
</template>
