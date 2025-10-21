<script lang="tsx" setup>
import { ConfigProvider, Pagination, type PaginationProps } from '@/components';
import { effect, ref } from 'vue';
const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;

const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if (type === 'prev') {
    return <a>Previous</a>;
  }
  if (type === 'next') {
    return <a>Next</a>;
  }
  return originalElement;
};

const current = ref(1);
const pageSize = ref(10);

effect(() => {
  console.log(current.value, pageSize.value);
});
</script>
<template>
  <Pagination size="small" :total="50" />
  <Pagination size="small" :total="50" show-size-changer show-quick-jumper />
  <Pagination size="small" :total="50" :show-total="showTotal" />
  <Pagination size="small" :total="50" disabled :show-total="showTotal" show-size-changer show-quick-jumper />
  <Pagination :total="500" :item-render="itemRender" />
  <ConfigProvider :theme="{ token: { wireframe: true } }">
    <Pagination v-model:current="current" v-model:page-size="pageSize" show-size-changer :total="500" />
    <br />
    <Pagination show-size-changer :current="3" :total="500" disabled />
    <br />
    <Pagination size="small" :current="50" :total="500" />
    <br />
    <Pagination disabled size="small" :current="50" :total="500" />
  </ConfigProvider>
</template>
