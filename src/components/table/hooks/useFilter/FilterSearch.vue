<script lang="tsx" setup>
import { SearchOutlined } from '@ant-design/icons-vue';
import type { AnyObject } from '../../../_util/type';
import Input from '../../../input/Input.vue';
import type { FilterSearchType, TableLocale } from '../../interface';

interface FilterSearchProps<RecordType = AnyObject> {
  value: string;
  onChange: (e) => void;
  filterSearch: FilterSearchType<RecordType>;
  tablePrefixCls: string;
  locale: TableLocale;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const { value, filterSearch, tablePrefixCls, locale, onChange } = defineProps<FilterSearchProps>();
</script>
<template>
  <div v-if="filterSearch" :class="`${tablePrefixCls}-filter-dropdown-search`">
    <Input
      :prefix="SearchOutlined"
      :placeholder="locale.filterSearchPlaceholder"
      @change="onChange"
      :value="value"
      :html-size="1"
      :class="`${tablePrefixCls}-filter-dropdown-search-input`"
    />
  </div>
</template>
