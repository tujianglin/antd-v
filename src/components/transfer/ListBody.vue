<script lang="tsx" setup>
import useControlledState from '@/vc-util/hooks/useControlledState';
import clsx from 'clsx';
import { computed, ref, watch } from 'vue';
import Pagination from '../pagination';
import type { KeyWiseTransferItem } from './index.vue';
import type { OmitProps, PaginationType, TransferKey } from './interface';
import ListItem from './ListItem.vue';
import type { RenderedItem, TransferListProps } from './Section.vue';

export type OmitProp = (typeof OmitProps)[number];
type PartialTransferListProps = Omit<TransferListProps, 'checkedKeys' | 'handleFilter' | 'handleClear'>;
type ExistPagination = Exclude<PaginationType, boolean>;

export interface TransferListBodyProps extends PartialTransferListProps {
  filteredItems: KeyWiseTransferItem[];
  filteredRenderItems: RenderedItem[];
  selectedKeys: TransferKey[];
}

export interface ListBodyRef {
  items?: RenderedItem[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  classNames,
  styles,
  filteredRenderItems,
  selectedKeys,
  disabled: globalDisabled,
  showRemove,
  pagination,
  onScroll,
  onItemSelect,
  onItemRemove,
} = defineProps<TransferListBodyProps>();
const parsePagination = (pagination?: ExistPagination) => {
  const defaultPagination: PaginationType = {
    simple: true,
    showSizeChanger: false,
    showLessItems: false,
  };

  return { ...defaultPagination, ...pagination };
};
const current = ref<number>(1);

const mergedPagination = computed(() => {
  if (!pagination) {
    return null;
  }

  const convertPagination = typeof pagination === 'object' ? pagination : {};

  return parsePagination(convertPagination);
});

const [pageSize, setPageSize] = useControlledState<number>(
  10,
  computed(() => mergedPagination.value?.pageSize),
);

watch(
  [() => filteredRenderItems, mergedPagination, pageSize],
  () => {
    if (mergedPagination.value) {
      const maxPageCount = Math.ceil(filteredRenderItems.length / pageSize.value!);
      current.value = Math.min(current.value, maxPageCount);
    }
  },
  { deep: true },
);

const onInternalClick = (item: KeyWiseTransferItem, e: MouseEvent) => {
  onItemSelect(item.key, !selectedKeys.includes(item.key), e);
};

const onRemove = (item: KeyWiseTransferItem) => {
  onItemRemove?.([item.key]);
};

const onPageChange = (cur: number) => {
  current.value = cur;
};

const onSizeChange = (cur: number, size: number) => {
  current.value = cur;
  setPageSize(size);
};

const memoizedItems = computed<RenderedItem[]>(() => {
  const displayItems = mergedPagination.value
    ? filteredRenderItems.slice((current.value - 1) * pageSize.value!, current.value * pageSize.value!)
    : filteredRenderItems;
  return displayItems;
});

defineExpose({
  get items() {
    return memoizedItems.value;
  },
});
</script>
<template>
  <ul
    :class="
      clsx(`${prefixCls}-content`, classNames.list, {
        [`${prefixCls}-content-show-remove`]: showRemove,
      })
    "
    :style="styles.list"
    @scroll="onScroll"
  >
    <ListItem
      v-for="{ renderedEl, renderedText, item } in memoizedItems || []"
      :key="item.key"
      :prefix-cls="prefixCls"
      :class-names="classNames"
      :styles="styles"
      :item="item"
      :rendered-text="renderedText"
      :rendered-el="renderedEl"
      :show-remove="showRemove"
      @click="onInternalClick"
      @remove="onRemove"
      :checked="selectedKeys.includes(item.key)"
      :disabled="globalDisabled || item.disabled"
    />
  </ul>
  <Pagination
    v-if="mergedPagination"
    size="small"
    :disabled="globalDisabled"
    :simple="mergedPagination.simple"
    :page-size="pageSize"
    :show-less-items="mergedPagination.showLessItems"
    :show-size-changer="mergedPagination.showSizeChanger"
    :class="`${prefixCls}-pagination`"
    :total="filteredRenderItems.length"
    :current="current"
    @change="onPageChange"
    @show-size-change="onSizeChange"
  />
</template>
