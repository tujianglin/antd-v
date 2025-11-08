<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { groupDisabledKeysMap, groupKeysMap } from '../_util/transKeys';
import { useComponentConfig } from '../config-provider/context';
import { useFormItemInputContextInject } from '../form/context';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import useData from './hooks/useData';
import useSelection from './hooks/useSelection';
import type { PaginationType, TransferKey } from './interface';
import type { TransferCustomListBodyProps, TransferListProps } from './Section.vue';
import useStyle from './style';
import { computed, getCurrentInstance, toRefs, type CSSProperties, type VNode } from 'vue';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { type PrevSelectedIndex, useMultipleSelect } from '../_util/hooks';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import clsx from 'clsx';
import Section from './Section.vue';
import Actions from './Actions.vue';

export type { TransferOperationProps } from './Actions.vue';
export type { TransferSearchProps } from './search.vue';
export type { TransferListProps } from './Section.vue';

export type SemanticName =
  | 'root'
  | 'section'
  | 'header'
  | 'title'
  | 'body'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'footer'
  | 'actions';

export type TransferClassNamesType = SemanticClassNamesType<TransferProps, SemanticName>;
export type TransferStylesType = SemanticStylesType<TransferProps, SemanticName>;

type RecordType = TransferItem;

export type TransferDirection = 'left' | 'right';

export interface RenderResultObject {
  label: VueNode;
  value: string;
}

export type RenderResult = VueNode | RenderResultObject | string | null;

export interface TransferItem {
  key?: TransferKey;
  title?: string;
  description?: string;
  disabled?: boolean;
  [name: string]: any;
}

export type KeyWise<T> = T & { key: TransferKey };

export type KeyWiseTransferItem = KeyWise<TransferItem>;

type TransferRender = (item: RecordType) => RenderResult;

export interface ListStyle {
  direction: TransferDirection;
}

export type SelectAllLabel = VueNode | ((info: { selectedCount: number; totalCount: number }) => VueNode);

export interface TransferLocale {
  titles?: VueNode[];
  notFoundContent?: VueNode | VueNode[];
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
  remove?: string;
  selectAll?: string;
  deselectAll?: string;
  selectCurrent?: string;
  selectInvert?: string;
  removeAll?: string;
  removeCurrent?: string;
}

export interface TransferSearchOption {
  placeholder?: string;
  defaultValue?: string;
}

export interface TransferProps<RecordType = any> {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: TransferClassNamesType;
  styles?: TransferStylesType;

  disabled?: boolean;
  dataSource?: RecordType[];
  render?: TransferRender;
  onChange?: (targetKeys: TransferKey[], direction: TransferDirection, moveKeys: TransferKey[]) => void;
  onSelectChange?: (sourceSelectedKeys: TransferKey[], targetSelectedKeys: TransferKey[]) => void;

  titles?: VueNode[];
  actions?: VueNode[];
  showSearch?: boolean | TransferSearchOption;
  filterOption?: (inputValue: string, item: RecordType, direction: TransferDirection) => boolean;
  locale?: Partial<TransferLocale>;
  footer?: (props: TransferListProps, info?: { direction: TransferDirection }) => VueNode;
  rowKey?: (record: RecordType) => TransferKey;
  onSearch?: (direction: TransferDirection, value: string) => void;
  onScroll?: (direction: TransferDirection, e) => void;
  showSelectAll?: boolean;
  selectAllLabels?: SelectAllLabel[];
  oneWay?: boolean;
  pagination?: PaginationType;
  status?: InputStatus;
  selectionsIcon?: VueNode;
}

defineOptions({ name: 'Transfer', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  classNames,
  styles,
  style,

  actions = [],

  dataSource,
  selectAllLabels = [],
  locale = {},
  titles,
  disabled = undefined,
  showSearch = false,

  showSelectAll = true,
  oneWay,
  pagination,
  status: customStatus,
  selectionsIcon,
  filterOption,
  render,
  footer,
  rowKey,
  onScroll,
  onChange,
  onSearch,
  onSelectChange,
} = defineProps<TransferProps>();

const slots = defineSlots<{ default: (props: TransferCustomListBodyProps) => VNode[] }>();

const targetKeys = defineModel<TransferKey[]>('targetKeys', { default: [] });
const selectedKeys = defineModel<TransferKey[]>('selectedKeys', { default: [] });

const {
  getPrefixCls,
  renderEmpty,
  direction: dir,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  selectionsIcon: contextSelectionsIcon,
} = toRefs(useComponentConfig('transfer'));

const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => disabled ?? contextDisabled?.value);

const prefixCls = computed(() => getPrefixCls.value('transfer', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

// Fill record with `key`
const [mergedDataSource, leftDataSource, rightDataSource] = useData(
  computed(() => dataSource),
  computed(() => rowKey),
  targetKeys,
);

// Get direction selected keys
const [
  // Keys
  sourceSelectedKeys,
  targetSelectedKeys,
  // Setters
  setSourceSelectedKeys,
  setTargetSelectedKeys,
] = useSelection(leftDataSource as any, rightDataSource as any, selectedKeys);

const [leftMultipleSelect, updateLeftPrevSelectedIndex] = useMultipleSelect<KeyWise<RecordType>, TransferKey>((item) => item.key);
const [rightMultipleSelect, updateRightPrevSelectedIndex] = useMultipleSelect<KeyWise<RecordType>, TransferKey>(
  (item) => item.key,
);

const setStateKeys = (direction: TransferDirection, keys: TransferKey[] | ((prevKeys: TransferKey[]) => TransferKey[])) => {
  if (direction === 'left') {
    const nextKeys = typeof keys === 'function' ? keys(sourceSelectedKeys.value || []) : keys;
    setSourceSelectedKeys(nextKeys);
  } else {
    const nextKeys = typeof keys === 'function' ? keys(targetSelectedKeys.value || []) : keys;
    setTargetSelectedKeys(nextKeys);
  }
};

const setPrevSelectedIndex = (direction: TransferDirection, value: PrevSelectedIndex) => {
  const isLeftDirection = direction === 'left';
  const updatePrevSelectedIndex = isLeftDirection ? updateLeftPrevSelectedIndex : updateRightPrevSelectedIndex;
  updatePrevSelectedIndex(value);
};

const handleSelectChange = (direction: TransferDirection, holder: TransferKey[]) => {
  if (direction === 'left') {
    selectedKeys.value = [...holder, ...targetSelectedKeys.value];
    onSelectChange?.(holder, targetSelectedKeys.value);
  } else {
    selectedKeys.value = [...sourceSelectedKeys.value, ...holder];
    onSelectChange?.(sourceSelectedKeys.value, holder);
  }
};

const getTitles = (transferLocale: TransferLocale): VueNode[] => titles ?? transferLocale.titles ?? [];

const handleLeftScroll = (e) => {
  onScroll?.('left', e);
};

const handleRightScroll = (e) => {
  onScroll?.('right', e);
};

const moveTo = (direction: TransferDirection) => {
  const moveKeys = direction === 'right' ? sourceSelectedKeys.value : targetSelectedKeys.value;
  const dataSourceDisabledKeysMap = groupDisabledKeysMap(mergedDataSource.value);
  // filter the disabled options
  const newMoveKeys = moveKeys.filter((key) => !dataSourceDisabledKeysMap.has(key));
  const newMoveKeysMap = groupKeysMap(newMoveKeys);
  // move items to target box
  const newTargetKeys =
    direction === 'right'
      ? newMoveKeys.concat(targetKeys.value)
      : targetKeys.value.filter((targetKey) => !newMoveKeysMap.has(targetKey));

  // empty checked keys
  const oppositeDirection = direction === 'right' ? 'left' : 'right';
  setStateKeys(oppositeDirection, []);
  handleSelectChange(oppositeDirection, []);
  targetKeys.value = newTargetKeys;
  onChange?.(newTargetKeys, direction, newMoveKeys);
};

const moveToLeft = () => {
  moveTo('left');
  setPrevSelectedIndex('left', null);
};

const moveToRight = () => {
  moveTo('right');
  setPrevSelectedIndex('right', null);
};

const onItemSelectAll = (direction: TransferDirection, keys: string[], checkAll: boolean | 'replace') => {
  setStateKeys(direction, (prevKeys) => {
    let mergedCheckedKeys: TransferKey[] = [];
    if (checkAll === 'replace') {
      mergedCheckedKeys = keys;
    } else if (checkAll) {
      // Merge current keys with origin key
      mergedCheckedKeys = Array.from(new Set<TransferKey>([...prevKeys, ...keys]));
    } else {
      const selectedKeysMap = groupKeysMap(keys);
      // Remove current keys from origin keys
      mergedCheckedKeys = prevKeys.filter((key) => !selectedKeysMap.has(key));
    }
    handleSelectChange(direction, mergedCheckedKeys);
    return mergedCheckedKeys;
  });
  setPrevSelectedIndex(direction, null);
};

const onLeftItemSelectAll = (keys: string[], checkAll: boolean) => {
  onItemSelectAll('left', keys, checkAll);
};

const onRightItemSelectAll = (keys: string[], checkAll: boolean) => {
  onItemSelectAll('right', keys, checkAll);
};

const leftFilter = (e) => onSearch?.('left', e.target.value);

const rightFilter = (e) => onSearch?.('right', e.target.value);

const handleLeftClear = () => onSearch?.('left', '');

const handleRightClear = () => onSearch?.('right', '');

const handleSingleSelect = (
  direction: TransferDirection,
  holder: Set<TransferKey>,
  selectedKey: TransferKey,
  checked: boolean,
  currentSelectedIndex: number,
) => {
  const isSelected = holder.has(selectedKey);
  if (isSelected) {
    holder.delete(selectedKey);
    setPrevSelectedIndex(direction, null);
  }
  if (checked) {
    holder.add(selectedKey);
    setPrevSelectedIndex(direction, currentSelectedIndex);
  }
};

const handleMultipleSelect = (
  direction: TransferDirection,
  data: KeyWise<RecordType>[],
  holder: Set<TransferKey>,
  currentSelectedIndex: number,
) => {
  const isLeftDirection = direction === 'left';
  const multipleSelect = isLeftDirection ? leftMultipleSelect : rightMultipleSelect;
  multipleSelect(currentSelectedIndex, data, holder);
};

const onItemSelect = (direction: TransferDirection, selectedKey: TransferKey, checked: boolean, multiple?: boolean) => {
  const isLeftDirection = direction === 'left';
  const holder = [...(isLeftDirection ? sourceSelectedKeys.value : targetSelectedKeys.value)];
  const holderSet = new Set(holder);
  const data = [...(isLeftDirection ? leftDataSource.value : rightDataSource.value)].filter((item) => !item?.disabled);
  const currentSelectedIndex = data.findIndex((item) => item.key === selectedKey);
  // multiple select by hold down the shift key
  if (multiple && holder.length > 0) {
    handleMultipleSelect(direction, data as any, holderSet, currentSelectedIndex);
  } else {
    handleSingleSelect(direction, holderSet, selectedKey, checked, currentSelectedIndex);
  }
  const holderArr = Array.from(holderSet);
  handleSelectChange(direction, holderArr);
  if (!selectedKeys.value) {
    setStateKeys(direction, holderArr);
  }
};

const onLeftItemSelect: TransferListProps['onItemSelect'] = (selectedKey, checked, e) => {
  onItemSelect('left', selectedKey, checked, e?.shiftKey);
};

const onRightItemSelect = (selectedKey: TransferKey, checked: boolean, e?: MouseEvent) => {
  onItemSelect('right', selectedKey, checked, e?.shiftKey);
};

const onRightItemRemove = (keys: TransferKey[]) => {
  setStateKeys('right', []);
  targetKeys.value = targetKeys.value.filter((key) => !keys.includes(key));
  onChange?.(targetKeys.value, 'left', [...keys]);
};

const { hasFeedback, status } = toRefs(useFormItemInputContextInject());

const getLocale = (transferLocale: TransferLocale) => ({
  ...transferLocale,
  notFoundContent: () => renderEmpty?.value?.('Transfer') || <DefaultRenderEmpty componentName="Transfer" />,
  ...locale,
});

const mergedStatus = computed(() => getMergedStatus(status?.value, customStatus));
const mergedPagination = computed(() => !slots.default && pagination);

const leftActive = computed(
  () => rightDataSource.value.filter((d) => targetSelectedKeys.value.includes(d.key as TransferKey) && !d.disabled).length > 0,
);
const rightActive = computed(
  () => leftDataSource.value.filter((d) => sourceSelectedKeys.value.includes(d.key as TransferKey) && !d.disabled).length > 0,
);

// ====================== Styles ======================
const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<TransferClassNamesType, TransferStylesType, TransferProps<RecordType>>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      disabled: mergedDisabled.value,
    },
  })),
);

const cls = computed(() =>
  clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-disabled`]: mergedDisabled.value,
      [`${prefixCls.value}-customize-list`]: !!slots.default,
      [`${prefixCls.value}-rtl`]: dir.value === 'rtl',
    },
    getStatusClassNames(prefixCls.value, mergedStatus.value, hasFeedback?.value),
    contextClassName?.value,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    mergedClassNames?.value?.root,
  ),
);

// ====================== Locale ======================
const [contextLocale] = useLocale('Transfer', defaultLocale.Transfer);

const listLocale = computed(() => getLocale(contextLocale.value!));

const listTitle = computed(() => getTitles(listLocale.value));
const leftTitle = () => listTitle.value[0];
const rightTitle = () => listTitle.value[1];

const mergedSelectionsIcon = computed(() => selectionsIcon ?? contextSelectionsIcon?.value);
</script>
<template>
  <div :class="cls" :style="{ ...contextStyle, ...mergedStyles.root, ...style }">
    <Section
      :prefix-cls="prefixCls"
      :class-names="mergedClassNames"
      :styles="mergedStyles"
      :title-text="leftTitle"
      :data-source="leftDataSource"
      :filter-option="filterOption"
      v-model:checked-keys="sourceSelectedKeys"
      :handle-filter="leftFilter"
      :handle-clear="handleLeftClear"
      @item-select="onLeftItemSelect"
      @item-select-all="onLeftItemSelectAll as any"
      :render="render"
      :show-search="showSearch"
      :render-list="slots.default"
      :footer="footer"
      @scroll="handleLeftScroll"
      :disabled="mergedDisabled"
      :direction="dir === 'rtl' ? 'right' : 'left'"
      :show-select-all="showSelectAll"
      :select-all-label="selectAllLabels[0]"
      :pagination="mergedPagination"
      :selections-icon="mergedSelectionsIcon"
      v-bind="listLocale"
    />
    <Actions
      :class="clsx(`${prefixCls}-actions`, mergedClassNames.actions)"
      :right-active="rightActive"
      :move-to-right="moveToRight"
      :left-active="leftActive"
      :actions="actions"
      :move-to-left="moveToLeft"
      :style="mergedStyles.actions"
      :disabled="mergedDisabled"
      :direction="dir"
      :one-way="oneWay"
    />
    <Section
      :prefix-cls="prefixCls"
      :class-names="mergedClassNames"
      :styles="mergedStyles"
      :title-text="rightTitle"
      :data-source="rightDataSource"
      :filter-option="filterOption"
      v-model:checked-keys="targetSelectedKeys"
      :handle-filter="rightFilter"
      :handle-clear="handleRightClear"
      @item-select="onRightItemSelect"
      @item-select-all="onRightItemSelectAll as any"
      @item-remove="onRightItemRemove"
      :render="render"
      :show-search="showSearch"
      :render-list="slots.default"
      :footer="footer"
      @scroll="handleRightScroll"
      :disabled="mergedDisabled"
      :direction="dir === 'rtl' ? 'left' : 'right'"
      :show-select-all="showSelectAll"
      :select-all-label="selectAllLabels[1]"
      :show-remove="oneWay"
      :pagination="mergedPagination"
      :selections-icon="mergedSelectionsIcon"
      v-bind="listLocale"
    />
  </div>
</template>
