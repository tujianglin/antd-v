<script lang="tsx" setup>
import { Pagination, type PaginationProps } from '@/components';
const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
</script>
<template>
  <Pagination size="small" :total="50" />
  <Pagination size="small" :total="50" show-size-changer show-quick-jumper />
  <Pagination size="small" :total="50" :show-total="showTotal" />
  <Pagination size="small" :total="50" disabled :show-total="showTotal" show-size-changer show-quick-jumper />
</template>
