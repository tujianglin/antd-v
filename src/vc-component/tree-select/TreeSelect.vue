<script lang="tsx" setup>
import { BaseSelect, type BaseSelectPropsWithoutPrivate } from '@/vc-component/select';
import type { IconType } from '@/vc-component/tree/interface';
import type { ExpandAction } from '@/vc-component/tree/Tree.vue';
import { conductCheck } from '@/vc-component/tree/utils/conductUtil';
import useControlledState from '@/vc-util/hooks/useControlledState';
import { reactiveComputed } from '@vueuse/core';
import { isEmpty } from 'es-toolkit/compat';
import { computed, ref, toRefs, useId, useTemplateRef, type CSSProperties } from 'vue';
import useCache from './hooks/useCache';
import useCheckedKeys from './hooks/useCheckedKeys';
import useDataEntities from './hooks/useDataEntities';
import useFilterTreeData from './hooks/useFilterTreeData';
import useRefFunc from './hooks/useRefFunc';
import useTreeData from './hooks/useTreeData';
import type {
  ChangeEventExtra,
  DataNode,
  DefaultValueType,
  FieldNames,
  LabeledValueType,
  LegacyDataNode,
  SelectSource,
  SimpleModeConfig,
  VueKey,
} from './interface';
import { LegacySelectContextProvider } from './LegacyContext';
import OptionList from './OptionList.vue';
import { TreeSelectContextProvider, type TreeSelectContextProps } from './TreeSelectContext';
import { fillAdditionalInfo, fillLegacyProps } from './utils/legacyUtil';
import { formatStrategyValues, SHOW_ALL, SHOW_CHILD, type CheckedStrategy } from './utils/strategyUtil';
import { fillFieldNames, isNil, toArray } from './utils/valueUtil';

export type SemanticName = 'input' | 'prefix' | 'suffix';
export type PopupSemantic = 'item' | 'itemTitle';
export interface SearchConfig {
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
  filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean);
  treeNodeFilterProp?: string;
}
export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode>
  extends Omit<BaseSelectPropsWithoutPrivate, 'mode' | 'classNames' | 'styles' | 'showSearch'> {
  prefixCls?: string;
  id?: string | number;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  // >>> Value
  onChange?: (value: ValueType, labelList: any[], extra: ChangeEventExtra) => void;

  // >>> Search
  showSearch?: boolean | SearchConfig;

  // >>> Select
  onSelect?: (value: ValueType, option: OptionType) => void;
  onDeselect?: (value: ValueType, option: OptionType) => void;

  // >>> Selector
  showCheckedStrategy?: CheckedStrategy;
  treeNodeLabelProp?: string;

  // >>> Field Names
  fieldNames?: FieldNames;

  // >>> Mode
  multiple?: boolean;
  treeCheckable?: any;
  treeCheckStrictly?: boolean;
  labelInValue?: boolean;
  maxCount?: number;

  // >>> Data
  treeData?: OptionType[];
  treeDataSimpleMode?: boolean | SimpleModeConfig;
  loadData?: (dataNode: LegacyDataNode) => Promise<unknown>;
  treeLoadedKeys?: VueKey[];
  onTreeLoad?: (loadedKeys: VueKey[]) => void;

  // >>> Expanded
  treeDefaultExpandAll?: boolean;
  treeExpandedKeys?: VueKey[];
  treeDefaultExpandedKeys?: VueKey[];
  onTreeExpand?: (expandedKeys: VueKey[]) => void;
  treeExpandAction?: ExpandAction;

  // >>> Options
  virtual?: boolean;
  listHeight?: number;
  listItemHeight?: number;
  listItemScrollOffset?: number;
  onPopupVisibleChange?: (open: boolean) => void;
  treeTitleRender?: (node: OptionType) => any;

  // >>> Tree
  treeLine?: boolean;
  treeIcon?: any;
  showTreeIcon?: boolean;
  switcherIcon?: IconType;
  treeMotion?: any;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id: _,
  prefixCls = 'rc-tree-select',

  // Value
  onChange,
  onSelect,
  onDeselect,

  // Search
  showSearch,
  // Selector
  showCheckedStrategy,
  treeNodeLabelProp,

  //  Mode
  multiple,
  treeCheckable,
  treeCheckStrictly,
  labelInValue,
  maxCount,

  // FieldNames
  fieldNames,

  // Data
  treeDataSimpleMode,
  treeData,
  loadData,
  treeLoadedKeys,
  onTreeLoad,

  // Expanded
  treeDefaultExpandAll,
  treeExpandedKeys,
  treeDefaultExpandedKeys,
  onTreeExpand,
  treeExpandAction,

  // Options
  virtual = true,
  listHeight = 200,
  listItemHeight = 20,
  listItemScrollOffset = 0,

  onPopupVisibleChange,
  popupMatchSelectWidth = true,

  // Tree
  treeLine,
  treeIcon,
  showTreeIcon = true,
  switcherIcon,
  treeMotion,
  treeTitleRender,

  onPopupScroll,

  classNames: treeSelectClassNames,
  styles,
  ...restProps
} = defineProps<TreeSelectProps>();

function isRawValue(value: VueKey | LabeledValueType): value is VueKey {
  return !value || typeof value !== 'object';
}

const mergedId = useId();
const treeConduction = computed(() => treeCheckable && !treeCheckStrictly);
const mergedCheckable = computed(() => treeCheckable || treeCheckStrictly);
const mergedLabelInValue = computed(() => treeCheckStrictly || labelInValue);
const mergedMultiple = computed(() => mergedCheckable.value || multiple);

const {
  searchValue,
  onSearch,
  autoClearSearchValue = ref(true),
  filterTreeNode,
  treeNodeFilterProp = ref('value'),
} = toRefs(reactiveComputed(() => (typeof showSearch === 'boolean' && showSearch === true ? {} : showSearch || {})));

const internalValue = defineModel<any>('value');

const open = defineModel('open', { default: false });

// `multiple` && `!treeCheckable` should be show all
const mergedShowCheckedStrategy = computed(() => {
  if (!treeCheckable) {
    return SHOW_ALL;
  }

  return showCheckedStrategy || SHOW_CHILD;
});

// ========================= FieldNames =========================
const mergedFieldNames = computed<FieldNames>(() => fillFieldNames(fieldNames));

// =========================== Search ===========================
const [internalSearchValue, setSearchValue] = useControlledState('', searchValue);
const mergedSearchValue = computed(() => internalSearchValue.value || '');

const onInternalSearch = (searchText) => {
  setSearchValue(searchText);
  onSearch?.value?.(searchText);
};

// ============================ Data ============================
// `useTreeData` only do convert of `children` or `simpleMode`.
// Else will return origin `treeData` for perf consideration.
// Do not do anything to loop the data.
const mergedTreeData = useTreeData(
  computed(() => treeData),
  computed(() => treeDataSimpleMode),
);

const { keyEntities, valueEntities } = toRefs(useDataEntities(mergedTreeData, mergedFieldNames));

/** Get `missingRawValues` which not exist in the tree yet */
const splitRawValues = (newRawValues: VueKey[]) => {
  const missingRawValues = [];
  const existRawValues = [];

  // Keep missing value in the cache
  newRawValues.forEach((val) => {
    if (valueEntities.value.has(val)) {
      existRawValues.push(val);
    } else {
      missingRawValues.push(val);
    }
  });

  return { missingRawValues, existRawValues };
};

// Filtered Tree
const filteredTreeData = useFilterTreeData(
  mergedTreeData,
  mergedSearchValue,
  reactiveComputed(() => ({
    fieldNames: mergedFieldNames.value,
    treeNodeFilterProp: treeNodeFilterProp.value,
    filterTreeNode: filterTreeNode?.value,
  })),
);
// =========================== Label ============================
const getLabel = (item: DataNode) => {
  if (item) {
    if (treeNodeLabelProp) {
      return item[treeNodeLabelProp];
    }

    // Loop from fieldNames
    const { _title: titleList } = mergedFieldNames.value;

    for (let i = 0; i < titleList.length; i += 1) {
      const title = item[titleList[i]];
      if (title !== undefined) {
        return title;
      }
    }
  }
};

// ========================= Wrap Value =========================
const toLabeledValues = (draftValues: DefaultValueType) => {
  const values = toArray(draftValues);

  return values.map((val) => {
    if (isRawValue(val)) {
      return { value: val };
    }
    return val;
  });
};

const convert2LabelValues = (draftValues: DefaultValueType) => {
  const values = toLabeledValues(draftValues);

  return values.map((item) => {
    let { label: rawLabel } = item;
    const { value: rawValue, halfChecked: rawHalfChecked } = item;

    let rawDisabled: boolean | undefined;

    const entity = valueEntities.value.get(rawValue);

    // Fill missing label & status
    if (entity) {
      rawLabel = treeTitleRender ? treeTitleRender(entity.node) : (rawLabel ?? getLabel(entity.node));
      rawDisabled = entity.node.disabled;
    } else if (rawLabel === undefined) {
      // We try to find in current `labelInValue` value
      const labelInValueItem = toLabeledValues(internalValue.value).find((labeledItem) => labeledItem.value === rawValue);
      rawLabel = labelInValueItem?.label;
    }
    return {
      label: rawLabel,
      value: rawValue,
      halfChecked: rawHalfChecked,
      disabled: rawDisabled,
    };
  });
};

// =========================== Values ===========================
const rawMixedLabeledValues = computed(() => toLabeledValues(internalValue.value === null ? [] : internalValue.value));

// Split value into full check and half check
const { rawLabeledValues, rawHalfLabeledValues } = toRefs(
  reactiveComputed(() => {
    const fullCheckValues: LabeledValueType[] = [];
    const halfCheckValues: LabeledValueType[] = [];

    rawMixedLabeledValues.value.forEach((item) => {
      if (item.halfChecked) {
        halfCheckValues.push(item);
      } else {
        fullCheckValues.push(item);
      }
    });
    return { rawLabeledValues: fullCheckValues, rawHalfLabeledValues: halfCheckValues };
  }),
);

// const [mergedValues] = useCache(rawLabeledValues);
const rawValues = computed(() => rawLabeledValues.value.map((item) => item.value));

// Convert value to key. Will fill missed keys for conduct check.
const { rawCheckedValues, rawHalfCheckedValues } = toRefs(
  useCheckedKeys(rawLabeledValues, rawHalfLabeledValues, treeConduction, keyEntities),
);

// Convert rawCheckedKeys to check strategy related values
const displayValues = computed(() => {
  // Collect keys which need to show
  const displayKeys = formatStrategyValues(
    rawCheckedValues.value as VueKey[],
    mergedShowCheckedStrategy.value,
    keyEntities.value,
    mergedFieldNames.value,
  );

  // Convert to value and filled with label
  const values = displayKeys.map((key) => keyEntities.value[key]?.node?.[mergedFieldNames.value.value] ?? key);

  // Back fill with origin label
  const labeledValues = values.map((val) => {
    const targetItem = rawLabeledValues.value.find((item) => item.value === val);
    const label = labelInValue ? targetItem?.label : treeTitleRender?.(targetItem);
    return {
      value: val,
      label,
    };
  });

  const rawDisplayValues = convert2LabelValues(labeledValues);

  const firstVal = rawDisplayValues[0];

  if (!mergedMultiple.value && firstVal && isNil(firstVal.value) && isNil(firstVal.label)) {
    return [];
  }

  return rawDisplayValues.map((item) => ({
    ...item,
    label: item.label ?? item.value,
  }));
});

const cachedDisplayValues = useCache(displayValues);

// ========================== MaxCount ==========================
const mergedMaxCount = computed(() => {
  if (mergedMultiple.value && (mergedShowCheckedStrategy.value === 'SHOW_CHILD' || treeCheckStrictly || !treeCheckable)) {
    return maxCount;
  }
  return null;
});

// =========================== Change ===========================
const triggerChange = useRefFunc(
  (newRawValues: VueKey[], extra: { triggerValue?: VueKey; selected?: boolean }, source: SelectSource) => {
    const formattedKeyList = formatStrategyValues(
      newRawValues,
      mergedShowCheckedStrategy.value,
      keyEntities.value,
      mergedFieldNames.value,
    );

    // Not allow pass with `maxCount`
    if (mergedMaxCount.value && formattedKeyList.length > mergedMaxCount.value) {
      return;
    }

    // Clean up if needed
    if (autoClearSearchValue.value) {
      setSearchValue('');
    }

    // Generate rest parameters is costly, so only do it when necessary
    let eventValues: VueKey[] = newRawValues;
    if (treeConduction.value) {
      eventValues = formattedKeyList.map((key) => {
        const entity = valueEntities.value.get(key);
        return entity ? entity.node[mergedFieldNames.value.value] : key;
      });
    }

    const { triggerValue, selected } = extra || {
      triggerValue: undefined,
      selected: undefined,
    };

    let returnRawValues: (LabeledValueType | VueKey)[] = eventValues;

    // We need fill half check back
    if (treeCheckStrictly) {
      const halfValues = rawHalfLabeledValues.value.filter((item) => !eventValues.includes(item.value));

      returnRawValues = [...returnRawValues, ...halfValues];
    }

    const returnLabeledValues = convert2LabelValues(returnRawValues);
    const additionalInfo = {
      // [Legacy] Always return as array contains label & value
      preValue: rawLabeledValues.value,
      triggerValue,
    } as ChangeEventExtra;

    // [Legacy] Fill legacy data if user query.
    // This is expansive that we only fill when user query
    // https://github.com/react-component/tree-select/blob/fe33eb7c27830c9ac70cd1fdb1ebbe7bc679c16a/src/Select.jsx
    let showPosition = true;
    if (treeCheckStrictly || (source === 'selection' && !selected)) {
      showPosition = false;
    }

    fillAdditionalInfo(additionalInfo, triggerValue, newRawValues, mergedTreeData.value, showPosition, mergedFieldNames.value);

    const returnValues = mergedLabelInValue.value ? returnLabeledValues : returnLabeledValues.map((item) => item.value);
    internalValue.value = mergedMultiple.value ? returnValues : returnValues[0];

    onChange?.(
      mergedMultiple.value ? returnValues : returnValues[0],
      mergedLabelInValue.value ? null : returnLabeledValues.map((item) => item.label),
      additionalInfo,
    );
  },
);

// ========================== Options ===========================
/** Trigger by option list */
const onOptionSelect = (selectedKey: VueKey, { selected, source }: { selected: boolean; source: SelectSource }) => {
  const entity = keyEntities.value[selectedKey];
  const node = entity?.node;
  const selectedValue = node?.[mergedFieldNames.value.value] ?? selectedKey;
  // Never be falsy but keep it safe
  if (!mergedMultiple.value) {
    // Single mode always set value
    triggerChange([selectedValue], { selected: true, triggerValue: selectedValue }, 'option');
  } else {
    let newRawValues = selected ? [...rawValues.value, selectedValue] : rawCheckedValues.value.filter((v) => v !== selectedValue);

    // Add keys if tree conduction
    if (treeConduction.value) {
      // Should keep missing values
      const { missingRawValues, existRawValues } = splitRawValues(newRawValues);
      const keyList = existRawValues.map((val) => valueEntities.value.get(val).key);

      // Conduction by selected or not
      let checkedKeys: VueKey[];
      if (selected) {
        ({ checkedKeys } = conductCheck(keyList, true, keyEntities.value));
      } else {
        ({ checkedKeys } = conductCheck(
          keyList,
          { checked: false, halfCheckedKeys: rawHalfCheckedValues.value },
          keyEntities.value,
        ));
      }

      // Fill back of keys
      newRawValues = [
        ...missingRawValues,
        ...checkedKeys.map((key) => keyEntities.value[key as VueKey].node[mergedFieldNames.value.value]),
      ];
    }
    triggerChange(newRawValues, { selected, triggerValue: selectedValue }, source || 'option');
  }

  // Trigger select event
  if (selected || !mergedMultiple.value) {
    onSelect?.(selectedValue, fillLegacyProps(node));
  } else {
    onDeselect?.(selectedValue, fillLegacyProps(node));
  }
};

// ========================== Dropdown ==========================
const onInternalPopupVisibleChange = (open: boolean) => {
  if (onPopupVisibleChange) {
    onPopupVisibleChange(open);
  }
};

// ====================== Display Change ========================
const onDisplayValuesChange = useRefFunc((newValues, info) => {
  const newRawValues = newValues.map((item) => item.value);

  if (info.type === 'clear') {
    triggerChange(newRawValues, {}, 'selection');
    return;
  }

  // TreeSelect only have multiple mode which means display change only has remove
  if (info.values.length) {
    onOptionSelect(info.values[0].value, { selected: false, source: 'selection' });
  }
});

// ========================== Context ===========================
const treeSelectContext = computed(() => {
  return {
    virtual,
    popupMatchSelectWidth,
    listHeight,
    listItemHeight,
    listItemScrollOffset,
    treeData: filteredTreeData.value,
    fieldNames: mergedFieldNames.value,
    onSelect: onOptionSelect,
    treeExpandAction,
    treeTitleRender,
    onPopupScroll,
    leftMaxCount: maxCount === undefined ? null : maxCount - cachedDisplayValues.value.length,
    leafCountOnly: mergedShowCheckedStrategy.value === 'SHOW_CHILD' && !treeCheckStrictly && !!treeCheckable,
    valueEntities: valueEntities.value,
    classNames: treeSelectClassNames,
    styles,
  } as TreeSelectContextProps;
});

// ======================= Legacy Context =======================
const legacyContext = computed(() => ({
  checkable: mergedCheckable.value,
  loadData,
  treeLoadedKeys,
  onTreeLoad,
  checkedKeys: rawCheckedValues.value,
  halfCheckedKeys: rawHalfCheckedValues.value,
  treeDefaultExpandAll,
  treeExpandedKeys,
  treeDefaultExpandedKeys,
  onTreeExpand,
  treeIcon,
  treeMotion,
  showTreeIcon,
  switcherIcon,
  treeLine,
  treeNodeFilterProp: treeNodeFilterProp.value,
  keyEntities: keyEntities.value,
}));

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <TreeSelectContextProvider :value="treeSelectContext">
    <LegacySelectContextProvider :value="legacyContext">
      <BaseSelect
        ref="domRef"
        v-bind="restProps"
        v-model:open="open"
        :class-names="{
          prefix: treeSelectClassNames?.prefix,
          suffix: treeSelectClassNames?.suffix,
          input: treeSelectClassNames?.input,
        }"
        :styles="{
          prefix: styles?.prefix,
          suffix: styles?.suffix,
          input: styles?.input,
        }"
        :id="mergedId"
        :prefix-cls="prefixCls"
        :mode="mergedMultiple ? 'multiple' : undefined"
        :display-values="cachedDisplayValues"
        @display-values-change="onDisplayValuesChange"
        :auto-clear-search-value="autoClearSearchValue"
        :show-search="(typeof showSearch === 'boolean' && showSearch === true) || !isEmpty(showSearch)"
        :search-value="mergedSearchValue"
        @search="onInternalSearch"
        :-option-list="OptionList"
        :empty-options="!mergedTreeData?.length"
        @popup-visible-change="onInternalPopupVisibleChange"
        :popup-match-select-width="popupMatchSelectWidth"
      />
    </LegacySelectContextProvider>
  </TreeSelectContextProvider>
</template>
