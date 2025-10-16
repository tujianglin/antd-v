<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import type { CascaderProps, DefaultOptionType, InternalValueType, SingleValueType } from './Cascader.vue';
import { CascaderContextProvider, type CascaderContextProps } from './context';
import useMissingValues from './hooks/useMissingValues';
import useOptions from './hooks/useOptions';
import useSelect from './hooks/useSelect';
import useValues from './hooks/useValues';
import RawOptionList from './OptionList/List.vue';
import { fillFieldNames, toRawValues } from './utils/commonUtil';
import { toPathOptions } from './utils/treeUtil';

export type PickType =
  | 'changeOnSelect'
  | 'onChange'
  | 'options'
  | 'prefixCls'
  | 'checkable'
  | 'fieldNames'
  | 'showCheckedStrategy'
  | 'loadData'
  | 'expandTrigger'
  | 'expandIcon'
  | 'loadingIcon'
  | 'class'
  | 'style'
  | 'direction'
  | 'notFoundContent'
  | 'disabled';

export type PanelProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | any = false,
> = Pick<CascaderProps<OptionType, ValueField, Multiple>, PickType>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-cascader',
  style,
  class: className,
  options,
  checkable,
  fieldNames,
  changeOnSelect,
  onChange,
  showCheckedStrategy,
  loadData,
  expandTrigger,
  expandIcon = '>',
  loadingIcon,
  direction,
  notFoundContent = 'Not Found',
  disabled,
} = defineProps<PanelProps>();

// ======================== Multiple ========================
const multiple = computed(() => !!checkable);

// ========================= Values =========================
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

// ========================= Values =========================
const getMissingValues = computed(() => useMissingValues(mergedOptions.value, mergedFieldNames.value));

// Fill `rawValues` with checked conduction values
const { checkedValues, halfCheckedValues, missingCheckedValues } = toRefs(
  useValues(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues),
);

// =========================== Change ===========================
const triggerChange = (nextValues: InternalValueType) => {
  rawValues.value = toRawValues(nextValues);
  // Save perf if no need trigger event
  if (onChange) {
    const nextRawValues = toRawValues(nextValues);

    const valueOptions = nextRawValues.map((valueCells) =>
      toPathOptions(valueCells, mergedOptions.value, mergedFieldNames.value).map((valueOpt) => valueOpt.option),
    );

    const triggerValues = multiple.value ? nextRawValues : nextRawValues[0];
    const triggerOptions = multiple.value ? valueOptions : valueOptions[0];

    onChange(triggerValues as any, triggerOptions);
  }
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
  handleSelection.value?.(valuePath);
};

// ======================== Context =========================
const cascaderContext = computed<CascaderContextProps>(() => ({
  options: mergedOptions.value,
  fieldNames: mergedFieldNames.value,
  values: checkedValues.value,
  halfValues: halfCheckedValues.value,
  changeOnSelect,
  onSelect: onInternalSelect,
  checkable,
  searchOptions: [],
  popupPrefixCls: undefined,
  loadData,
  expandTrigger,
  expandIcon,
  loadingIcon,
  popupMenuColumnStyle: undefined,
}));

// ========================= Render =========================
const panelPrefixCls = computed(() => `${prefixCls}-panel`);
const isEmpty = computed(() => !mergedOptions.value.length);
</script>
<template>
  <CascaderContextProvider :value="cascaderContext">
    <div
      :class="
        clsx(
          panelPrefixCls,
          {
            [`${panelPrefixCls}-rtl`]: direction === 'rtl',
            [`${panelPrefixCls}-empty`]: isEmpty,
          },
          className,
        )
      "
      :style="style"
    >
      <template v-if="isEmpty">
        <Render :content="notFoundContent" />
      </template>
      <RawOptionList
        v-else
        :prefix-cls="prefixCls"
        search-value=""
        :multiple="multiple"
        :toggle-open="() => {}"
        open
        :direction="direction"
        :disabled="disabled"
      />
    </div>
  </CascaderContextProvider>
</template>
