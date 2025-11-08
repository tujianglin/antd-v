<!-- eslint-disable vue/define-macros-order -->
<script lang="tsx" setup>
import Dropdown, { type DropdownProps } from '@/components/dropdown';
import type { FieldDataNode } from '@/vc-component/tree';
import type { VueKey, VueNode } from '@/vc-util/type';
import { computed, ref, toRefs, watch, type ComputedRef, type Ref } from 'vue';
import { flattenKeys, type FilterState } from '.';
import type {
  ColumnFilterItem,
  ColumnType,
  FilterKey,
  FilterSearchType,
  GetPopupContainer,
  Key,
  TableLocale,
} from '../../interface';
import type { MenuProps } from '@/components/menu';
import Checkbox, { type CheckboxChangeEvent } from '@/components/checkbox';
import Radio from '@/components/radio';
import type { EventDataNode } from '@/components/tree';
import isEqual from '@/vc-util/isEqual';
import clsx from 'clsx';
import { useConfigContextInject } from '@/components/config-provider';
import Empty from '@/components/empty';
import FilterSearch from './FilterSearch.vue';
import Tree from '@/components/tree';
import Menu from '@/components/menu';
import Button from '@/components/button';
import OverrideProvider from '@/components/menu/OverrideProvider.vue';
import FilterDropdownMenuWrapper from './FilterWrapper.vue';
import { FilterFilled } from '@ant-design/icons-vue';
import extendsObject from '@/components/_util/extendsObject';

type FilterTreeDataNode = FieldDataNode<{ title: VueNode; key: string }>;

interface FilterRestProps {
  confirm?: boolean;
  closeDropdown?: boolean;
}

function hasSubMenu(filters: ColumnFilterItem[]) {
  return filters.some(({ children }) => children);
}

function searchValueMatched(searchValue: string, text: VueNode) {
  if (typeof text === 'string' || typeof text === 'number') {
    return text?.toString().toLowerCase().includes(searchValue.trim().toLowerCase());
  }
  return false;
}

function renderFilterItems({
  filters,
  prefixCls,
  filteredKeys,
  filterMultiple,
  searchValue,
  filterSearch,
}: {
  filters: ColumnFilterItem[];
  prefixCls: string;
  filteredKeys: Ref<Key[]>;
  filterMultiple: boolean;
  searchValue: Ref<string>;
  filterSearch: FilterSearchType<ColumnFilterItem>;
}): ComputedRef<Required<MenuProps>['items']> {
  return computed(() =>
    filters.map((filter, index) => {
      const key = String(filter.value);

      if (filter.children) {
        return {
          key: key || index,
          label: filter.text,
          popupClassName: `${prefixCls}-dropdown-submenu`,
          children: renderFilterItems({
            filters: filter.children,
            prefixCls,
            filteredKeys,
            filterMultiple,
            searchValue,
            filterSearch,
          }).value,
        };
      }

      const item = {
        key: filter.value !== undefined ? key : index,
        label: () => (
          <>
            {filterMultiple ? (
              <Checkbox checked={filteredKeys.value.includes(key)}></Checkbox>
            ) : (
              <Radio value={filteredKeys.value.includes(key)}></Radio>
            )}
            <span>{filter.text}</span>
          </>
        ),
      };
      if (searchValue.value.trim()) {
        if (typeof filterSearch === 'function') {
          return filterSearch(searchValue.value, filter) ? item : null;
        }
        return searchValueMatched(searchValue.value, filter.text) ? item : null;
      }
      return item;
    }),
  );
}

export type TreeColumnFilterItem = ColumnFilterItem & FilterTreeDataNode;

function wrapStringListType(keys?: FilterKey) {
  return (keys as string[]) || [];
}

export interface FilterDropdownProps {
  tablePrefixCls: string;
  prefixCls: string;
  dropdownPrefixCls: string;
  column: ColumnType;
  filterState?: FilterState;
  filterOnClose: boolean;
  filterMultiple: boolean;
  filterMode?: 'menu' | 'tree';
  filterSearch?: FilterSearchType<ColumnFilterItem | TreeColumnFilterItem>;
  columnKey: VueKey;
  triggerFilter: (filterState: FilterState) => void;
  locale: TableLocale;
  getPopupContainer?: GetPopupContainer;
  filterResetToDefaultFilteredValue?: boolean;
  rootClassName?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  tablePrefixCls,
  prefixCls,
  column,
  dropdownPrefixCls,
  columnKey,
  filterOnClose,
  filterMultiple,
  filterMode = 'menu',
  filterSearch = false,
  filterState,
  triggerFilter,
  locale,
  getPopupContainer,
  rootClassName,
} = defineProps<FilterDropdownProps>();

const filterResetToDefaultFilteredValue = computed(() => column.filterResetToDefaultFilteredValue);
const defaultFilteredValue = computed(() => column.defaultFilteredValue);
const filterDropdownProps = computed(() => column.filterDropdownProps || {});
const visible = ref(false);

const filtered = computed(() => !!(filterState && (filterState.filteredKeys?.length || filterState.forceFiltered)));
const triggerVisible = (newVisible: boolean) => {
  visible.value = newVisible;
  filterDropdownProps.value?.onOpenChange?.(newVisible);
};

const mergedVisible = computed(() => filterDropdownProps.value?.open ?? visible.value); // inner state

// ===================== Select Keys =====================
const propFilteredKeys = computed(() => filterState?.filteredKeys);
const filteredKeys = ref(wrapStringListType(propFilteredKeys.value));

const onSelectKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
  filteredKeys.value = selectedKeys;
};

const onCheck = (keys: string[], { node, checked }: { node: EventDataNode<FilterTreeDataNode>; checked: boolean }) => {
  if (!filterMultiple) {
    onSelectKeys({ selectedKeys: checked && node.key ? [node.key] : [] });
  } else {
    onSelectKeys({ selectedKeys: keys });
  }
};

watch(
  propFilteredKeys,
  () => {
    if (!visible.value) {
      return;
    }
    onSelectKeys({ selectedKeys: wrapStringListType(propFilteredKeys.value) });
  },
  { immediate: true, deep: true },
);

// ====================== Open Keys ======================
const openKeys = ref<string[]>([]);
const onOpenChange = (keys: string[]) => {
  openKeys.value = keys;
};

// search in tree mode column filter
const searchValue = ref('');
const onSearch = (e) => {
  const { value } = e.target;
  searchValue.value = value;
};
// clear search value after close filter dropdown
watch(
  visible,
  () => {
    if (!visible.value) {
      searchValue.value = '';
    }
  },
  { immediate: true },
);

// ======================= Submit ========================
const internalTriggerFilter = (keys?: string[]) => {
  const mergedKeys = keys?.length ? keys : null;
  if (mergedKeys === null && (!filterState || !filterState.filteredKeys)) {
    return null;
  }

  if (isEqual(mergedKeys, filterState?.filteredKeys, true)) {
    return null;
  }

  triggerFilter({
    column,
    key: columnKey,
    filteredKeys: mergedKeys,
  });
};

const onConfirm = () => {
  triggerVisible(false);
  internalTriggerFilter(filteredKeys.value);
};

const onReset = ({ confirm, closeDropdown }: FilterRestProps = { confirm: false, closeDropdown: false }) => {
  if (confirm) {
    internalTriggerFilter([]);
  }
  if (closeDropdown) {
    triggerVisible(false);
  }

  searchValue.value = '';

  if (filterResetToDefaultFilteredValue.value) {
    filteredKeys.value = (defaultFilteredValue.value || []).map((key) => String(key));
  } else {
    filteredKeys.value = [];
  }
};

const doFilter = ({ closeDropdown } = { closeDropdown: true }) => {
  if (closeDropdown) {
    triggerVisible(false);
  }
  internalTriggerFilter(filteredKeys.value);
};

const onVisibleChange: DropdownProps['onOpenChange'] = (newVisible, info) => {
  if (info.source === 'trigger') {
    if (newVisible && propFilteredKeys.value !== undefined) {
      // Sync filteredKeys on appear in controlled mode (propFilteredKeys !== undefined)
      filteredKeys.value = wrapStringListType(propFilteredKeys.value);
    }

    triggerVisible(newVisible);

    if (!newVisible && !column.filterDropdown && filterOnClose) {
      onConfirm();
    }
  }
};

// ======================== Style ========================
const dropdownMenuClass = computed(() =>
  clsx({
    [`${dropdownPrefixCls}-menu-without-submenu`]: !hasSubMenu(column.filters || []),
  }),
);

const onCheckAll = (e: CheckboxChangeEvent) => {
  if (e.target.checked) {
    const allFilterKeys = flattenKeys(column?.filters).map((key) => String(key));
    filteredKeys.value = allFilterKeys;
  } else {
    filteredKeys.value = [];
  }
};

const getTreeData = ({ filters }: { filters?: ColumnFilterItem[] }) =>
  (filters || []).map((filter, index) => {
    const key = String(filter.value);
    const item: FilterTreeDataNode = {
      title: filter.text,
      key: filter.value !== undefined ? key : String(index),
    };
    if (filter.children) {
      item.children = getTreeData({ filters: filter.children });
    }
    return item;
  });
const getFilterData = (node: FilterTreeDataNode): TreeColumnFilterItem => ({
  ...node,
  text: node.title,
  value: node.key,
  children: node.children?.map((item) => getFilterData(item)) || [],
});

const { direction, renderEmpty } = toRefs(useConfigContextInject());

const FilterComponent = () => {
  const selectedKeys = filteredKeys.value || [];

  const empty = renderEmpty?.value?.('Table.filter') ?? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={locale.filterEmptyText}
      styles={{
        image: {
          height: '24px',
        },
      }}
      style={{
        margin: 0,
        padding: '16px 0',
      }}
    />
  );
  if ((column.filters || []).length === 0) {
    return empty;
  }
  if (filterMode === 'tree') {
    return (
      <>
        <FilterSearch
          filterSearch={filterSearch as any}
          value={searchValue.value}
          onChange={onSearch}
          tablePrefixCls={tablePrefixCls}
          locale={locale}
        />
        <div class={`${tablePrefixCls}-filter-dropdown-tree`}>
          {filterMultiple ? (
            <Checkbox
              checked={selectedKeys.length === flattenKeys(column.filters).length}
              indeterminate={selectedKeys.length > 0 && selectedKeys.length < flattenKeys(column.filters).length}
              class={`${tablePrefixCls}-filter-dropdown-checkall`}
              onChange={onCheckAll}
            >
              {locale?.filterCheckAll}
            </Checkbox>
          ) : null}
          <Tree
            checkable
            selectable={false}
            blockNode
            multiple={filterMultiple}
            checkStrictly={!filterMultiple}
            class={`${dropdownPrefixCls}-menu`}
            onCheck={onCheck as any}
            checkedKeys={selectedKeys}
            selectedKeys={selectedKeys}
            showIcon={false}
            treeData={getTreeData({ filters: column.filters })}
            autoExpandParent
            defaultExpandAll
            filterTreeNode={
              searchValue.value.trim()
                ? (node: any) => {
                    if (typeof filterSearch === 'function') {
                      return filterSearch(searchValue.value, getFilterData(node));
                    }
                    return searchValueMatched(searchValue.value, node.title);
                  }
                : undefined
            }
          />
        </div>
      </>
    );
  }
  const items = renderFilterItems({
    filters: column.filters || [],
    filterSearch,
    prefixCls,
    filteredKeys,
    filterMultiple,
    searchValue,
  });
  const isEmpty = items.value.every((item) => item === null);

  return (
    <>
      <FilterSearch
        filterSearch={filterSearch as any}
        value={searchValue.value}
        onChange={onSearch}
        tablePrefixCls={tablePrefixCls}
        locale={locale}
      />
      {isEmpty ? (
        empty
      ) : (
        <Menu
          selectable
          multiple={filterMultiple}
          prefixCls={`${dropdownPrefixCls}-menu`}
          class={dropdownMenuClass.value}
          onSelect={onSelectKeys}
          onDeselect={onSelectKeys}
          selectedKeys={selectedKeys}
          getPopupContainer={getPopupContainer}
          openKeys={openKeys.value}
          onOpenChange={onOpenChange}
          items={items.value}
        />
      )}
    </>
  );
};

const resetDisabled = computed(() => {
  const selectedKeys = filteredKeys.value || [];
  if (filterResetToDefaultFilteredValue.value) {
    return isEqual(
      (defaultFilteredValue.value || []).map((key) => String(key)),
      selectedKeys,
      true,
    );
  }

  return selectedKeys.length === 0;
});

const DropdownContent = () => {
  let result;
  if (typeof column.filterDropdown === 'function') {
    result = (column.filterDropdown as any)({
      prefixCls: `${dropdownPrefixCls}-custom`,
      setSelectedKeys: (selectedKeys) => onSelectKeys({ selectedKeys: selectedKeys as string[] }),
      selectedKeys: filteredKeys,
      confirm: doFilter,
      clearFilters: onReset,
      filters: column.filters,
      visible: mergedVisible.value,
      close: () => {
        triggerVisible(false);
      },
    });
  } else if (column.filterDropdown) {
    result = column.filterDropdown;
  } else {
    result = (
      <>
        <FilterComponent></FilterComponent>
        <div class={`${prefixCls}-dropdown-btns`}>
          <Button type="link" size="small" disabled={resetDisabled.value} onClick={() => onReset()}>
            {locale.filterReset}
          </Button>
          <Button type="primary" size="small" onClick={onConfirm}>
            {locale.filterConfirm}
          </Button>
        </div>
      </>
    );
  }
  // We should not block customize Menu with additional props
  if (column.filterDropdown) {
    result = <OverrideProvider selectable={undefined}>{result}</OverrideProvider>;
  }

  result = <FilterDropdownMenuWrapper class={`${prefixCls}-dropdown`}>{result}</FilterDropdownMenuWrapper>;
  return result;
};

const DropdownTrigger = () => {
  let filterIcon;
  if (typeof column.filterIcon === 'function') {
    filterIcon = (column.filterIcon as any)(filtered.value);
  } else if (column.filterIcon) {
    filterIcon = column.filterIcon;
  } else {
    filterIcon = <FilterFilled />;
  }

  return (
    <span
      role="button"
      tabindex={-1}
      class={clsx(`${prefixCls}-trigger`, { active: filtered.value })}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {filterIcon}
    </span>
  );
};

const mergedDropdownProps = computed(() =>
  extendsObject(
    {
      trigger: ['click'],
      placement: direction?.value === 'rtl' ? 'bottomLeft' : 'bottomRight',
      getPopupContainer,
    },
    {
      ...filterDropdownProps.value,
      rootClassName: clsx(rootClassName, filterDropdownProps.value?.rootClassName),
      open: mergedVisible.value,
      onOpenChange: onVisibleChange,
      popupRender: () => <DropdownContent></DropdownContent>,
    },
  ),
);
</script>
<template>
  <div :class="`${prefixCls}-column`">
    <span :class="`${tablePrefixCls}-column-title`">
      <slot></slot>
    </span>
    <Dropdown v-bind="mergedDropdownProps"> <DropdownTrigger /> </Dropdown>
  </div>
</template>
