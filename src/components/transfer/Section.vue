<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { groupKeysMap } from '../_util/transKeys';
import Checkbox from '../checkbox';
import Dropdown from '../dropdown';
import type { MenuProps } from '../menu';
import type {
  KeyWiseTransferItem,
  RenderResult,
  RenderResultObject,
  SelectAllLabel,
  SemanticName,
  TransferDirection,
  TransferLocale,
  TransferSearchOption,
} from './index.vue';
import { OmitProps, type PaginationType, type TransferKey } from './interface';
import type { ListBodyRef, TransferListBodyProps } from './ListBody.vue';
import DefaultListBody from './ListBody.vue';
import Search from './search.vue';
import { isValidElement } from '@/vc-util/Children/util';
import { computed, getCurrentInstance, ref, type CSSProperties } from 'vue';
import { omit } from 'lodash-es';
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { DownOutlined } from '@ant-design/icons-vue';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';

export interface RenderedItem {
  renderedText: string;
  renderedEl: VueNode;
  item: KeyWiseTransferItem;
}

type RenderListFunction = (props: TransferListBodyProps) => VueNode;

export interface TransferListProps extends TransferLocale {
  prefixCls: string;
  style?: CSSProperties;
  classNames: SemanticClassNames<SemanticName>;
  styles: SemanticStyles<SemanticName>;

  titleText?: VueNode;
  dataSource?: KeyWiseTransferItem[];
  filterOption?: (filterText: string, item: KeyWiseTransferItem, direction: TransferDirection) => boolean;
  handleFilter: (e) => void;
  onItemSelect: (key: TransferKey, check: boolean, e?: MouseEvent) => void;
  onItemSelectAll: (dataSource: TransferKey[], checkAll: boolean | 'replace') => void;
  onItemRemove?: (keys: TransferKey[]) => void;
  handleClear: () => void;
  /** Render item */
  render?: (item: KeyWiseTransferItem) => RenderResult;
  showSearch?: boolean | TransferSearchOption;
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
  renderList?: RenderListFunction;
  footer?: (props: TransferListProps, info?: { direction: TransferDirection }) => VueNode;
  onScroll: (e) => void;
  disabled?: boolean;
  direction: TransferDirection;
  showSelectAll?: boolean;
  selectAllLabel?: SelectAllLabel;
  showRemove?: boolean;
  pagination?: PaginationType;
  selectionsIcon?: VueNode;
}

export interface TransferCustomListBodyProps extends TransferListBodyProps {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  style,
  classNames,
  styles,

  dataSource = [],
  titleText = '',
  disabled,
  showSearch = false,
  searchPlaceholder,
  notFoundContent,
  selectAll,
  deselectAll,
  selectCurrent,
  selectInvert,
  removeAll,
  removeCurrent,
  showSelectAll = true,
  showRemove,
  pagination,
  direction,
  itemsUnit,
  itemUnit,
  selectAllLabel,
  selectionsIcon,
  footer,
  renderList,
  onItemSelectAll,
  onItemRemove,
  handleFilter,
  handleClear,
  filterOption,
  render = () => null,
} = defineProps<TransferListProps>();

const checkedKeys = defineModel<TransferKey[]>('checkedKeys', { default: [] });

function isRenderResultPlainObject(result: RenderResult): result is RenderResultObject {
  return !!(result && !isValidElement(result) && Object.prototype.toString.call(result) === '[object Object]');
}

function getEnabledItemKeys(items: KeyWiseTransferItem[]) {
  return items.filter((data) => !data.disabled).map((data) => data.key);
}

const isValidIcon = (icon: VueNode) => icon !== undefined;

const getShowSearchOption = (showSearch: boolean | TransferSearchOption) => {
  if (showSearch && typeof showSearch === 'object') {
    return {
      ...showSearch,
      defaultValue: showSearch.defaultValue || '',
    };
  }
  return {
    defaultValue: '',
    placeholder: '',
  };
};

const sectionPrefixCls = computed(() => `${prefixCls}-section`);
const listPrefixCls = computed(() => `${prefixCls}-list`);

const searchOptions = computed(() => getShowSearchOption(showSearch));
const filterValue = ref<string>(searchOptions.value?.defaultValue);
const listBodyRef = ref<ListBodyRef>(null);

const internalHandleFilter = (e) => {
  filterValue.value = e.target.value;
  handleFilter(e);
};

const internalHandleClear = () => {
  filterValue.value = '';
  handleClear();
};

const matchFilter = (text: string, item) => {
  if (filterOption) {
    return filterOption(filterValue.value, item, direction);
  }
  return text.includes(filterValue.value);
};

const renderListBody = (listProps: TransferListBodyProps) => {
  let bodyContent: VueNode = renderList
    ? renderList({
        ...listProps,
        onItemSelect: (key, check) => listProps.onItemSelect(key, check),
      })
    : null;
  const customize: boolean = isValidElement(bodyContent);
  if (!customize) {
    // @ts-ignore
    bodyContent = <DefaultListBody ref={listBodyRef} {...listProps} prefixCls={listPrefixCls.value} />;
  }
  return { customize, bodyContent };
};

const renderItem = (item: any): RenderedItem => {
  const renderResult = render(item);
  const isRenderResultPlain = isRenderResultPlainObject(renderResult);
  return {
    item,
    renderedEl: isRenderResultPlain ? renderResult.label : renderResult,
    renderedText: isRenderResultPlain ? renderResult.value : (renderResult as string),
  };
};

const notFoundContentEle = computed<VueNode>(() =>
  Array.isArray(notFoundContent) ? notFoundContent[direction === 'left' ? 0 : 1] : notFoundContent,
);

const filterData = computed(() => {
  const filterItems: any[] = [];
  const filterRenderItems: RenderedItem[] = [];
  dataSource.forEach((item) => {
    const renderedItem = renderItem(item);
    if (filterValue.value && !matchFilter(renderedItem.renderedText, item)) {
      return;
    }
    filterItems.push(item);
    filterRenderItems.push(renderedItem);
  });
  return [filterItems, filterRenderItems] as const;
});

const filteredItems = computed(() => filterData.value[0]);
const filteredRenderItems = computed(() => filterData.value[1]);

const checkedActiveItems = computed<any[]>(() => {
  return filteredItems.value.filter((item) => checkedKeys.value.includes(item.key) && !item.disabled);
});

const checkStatus = computed<string>(() => {
  if (checkedActiveItems.value.length === 0) {
    return 'none';
  }
  const checkedKeysMap = groupKeysMap(checkedKeys.value);
  if (filteredItems.value.every((item) => checkedKeysMap.has(item.key) || !!item.disabled)) {
    return 'all';
  }
  return 'part';
});

const vm = getCurrentInstance() as unknown as { props: TransferListProps };
// ====================== Render ======================
const ListBody = () => {
  const search = showSearch ? (
    <div class={`${listPrefixCls.value}-body-search-wrapper`}>
      <Search
        prefixCls={`${listPrefixCls.value}-search`}
        onChange={internalHandleFilter}
        handleClear={internalHandleClear}
        placeholder={searchOptions.value?.placeholder || searchPlaceholder}
        v-model:value={filterValue.value}
        disabled={disabled}
      />
    </div>
  ) : null;

  const { customize, bodyContent } = renderListBody({
    ...omit(vm.props, OmitProps),
    filteredItems: filteredItems.value,
    filteredRenderItems: filteredRenderItems.value,
    selectedKeys: checkedKeys.value,
    classNames,
    styles,
  } as any);

  let bodyNode: VueNode;
  // We should wrap customize list body in a classNamed div to use flex layout.
  if (customize) {
    bodyNode = <div class={`${listPrefixCls.value}-body-customize-wrapper`}>{bodyContent}</div>;
  } else {
    bodyNode = filteredItems.value.length ? (
      bodyContent
    ) : (
      <div class={`${listPrefixCls.value}-body-not-found`}>
        <Render content={notFoundContentEle.value}></Render>
      </div>
    );
  }
  return (
    <div
      class={clsx(
        `${listPrefixCls.value}-body`,
        {
          [`${listPrefixCls.value}-body-with-search`]: showSearch,
        },
        classNames.body,
      )}
      style={styles.body}
    >
      {search}
      {bodyNode}
    </div>
  );
};
const getSelectAllLabel = (selectedCount: number, totalCount: number): VueNode => {
  if (selectAllLabel) {
    return typeof selectAllLabel === 'function' ? (selectAllLabel as any)?.({ selectedCount, totalCount }) : selectAllLabel;
  }
  const unit = totalCount > 1 ? itemsUnit : itemUnit;
  return (
    <>
      {(selectedCount > 0 ? `${selectedCount}/` : '') + totalCount} {unit}
    </>
  );
};

// Custom Layout
const footerDom = computed(() => footer && (footer.length < 2 ? footer(vm.props) : footer(vm.props, { direction })));

const items = computed(() => {
  let result: MenuProps['items'];
  if (showRemove) {
    result = [
      /* Remove Current Page */
      pagination
        ? {
            key: 'removeCurrent',
            label: removeCurrent,
            onClick() {
              const pageKeys = getEnabledItemKeys((listBodyRef.value?.items || []).map((entity) => entity.item));
              onItemRemove?.(pageKeys);
            },
          }
        : null,
      /* Remove All */
      {
        key: 'removeAll',
        label: removeAll,
        onClick() {
          onItemRemove?.(getEnabledItemKeys(filteredItems.value));
        },
      },
    ].filter(Boolean);
  } else {
    result = [
      {
        key: 'selectAll',
        label: checkStatus.value === 'all' ? deselectAll : selectAll,
        onClick() {
          const keys = getEnabledItemKeys(filteredItems.value);
          onItemSelectAll?.(keys, keys.length !== checkedKeys.value.length);
        },
      },
      pagination
        ? {
            key: 'selectCurrent',
            label: selectCurrent,
            onClick() {
              const pageItems = listBodyRef.value?.items || [];
              onItemSelectAll?.(getEnabledItemKeys(pageItems.map((entity) => entity.item)), true);
            },
          }
        : null,
      {
        key: 'selectInvert',
        label: selectInvert,
        onClick() {
          const availablePageItemKeys = getEnabledItemKeys((listBodyRef.value?.items || []).map((entity) => entity.item));
          const checkedKeySet = new Set(checkedKeys.value);
          const newCheckedKeysSet = new Set(checkedKeySet);
          availablePageItemKeys.forEach((key) => {
            if (checkedKeySet.has(key)) {
              newCheckedKeysSet.delete(key);
            } else {
              newCheckedKeysSet.add(key);
            }
          });
          onItemSelectAll?.(Array.from(newCheckedKeysSet), 'replace');
        },
      },
    ];
  }
  return result;
});
</script>
<template>
  <div
    :class="
      clsx(sectionPrefixCls, classNames.section, {
        [`${sectionPrefixCls}-with-pagination`]: !!pagination,
        [`${sectionPrefixCls}-with-footer`]: !!footerDom,
      })
    "
    :style="{ ...style, ...styles.section }"
  >
    <div :class="clsx(`${listPrefixCls}-header`, classNames.header)" :style="styles.header">
      <template v-if="showSelectAll">
        <Checkbox
          v-if="!showRemove && !pagination"
          :disabled="dataSource.filter((d) => !d.disabled).length === 0 || disabled"
          :checked="checkStatus === 'all'"
          :indeterminate="checkStatus === 'part'"
          :class="`${listPrefixCls}-checkbox`"
          @change="
            () => {
              // Only select enabled items
              onItemSelectAll?.(
                filteredItems.filter((item) => !item.disabled).map(({ key }) => key),
                checkStatus !== 'all',
              );
            }
          "
        />
        <Dropdown :class="`${listPrefixCls}-header-dropdown`" :menu="{ items }" :disabled="disabled">
          <Render v-if="isValidIcon(selectionsIcon)" :content="selectionsIcon" />
          <DownOutlined v-else />
        </Dropdown>
      </template>
      <span :class="`${listPrefixCls}-header-selected`">
        <Render :content="getSelectAllLabel(checkedActiveItems.length, filteredItems.length)" />
      </span>
      <span :class="clsx(`${listPrefixCls}-header-title`, classNames.title)" :style="styles.title">
        <Render :content="titleText" />
      </span>
    </div>
    <ListBody />
    <div v-if="footerDom" :class="clsx(`${listPrefixCls}-footer`, classNames.footer)" :style="styles.footer">
      <Render :content="footerDom" />
    </div>
  </div>
</template>
