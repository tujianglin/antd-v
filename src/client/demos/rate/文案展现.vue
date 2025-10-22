<script lang="tsx" setup>
import { Flex, Rate, type RateProps } from '@/components';
import { ref } from 'vue';

const value = ref(3);

const desc: RateProps['tooltips'] = [
  'terrible',
  { placement: 'top', title: 'bad', trigger: 'hover' },
  'normal',
  'good',
  'wonderful',
];

function getDescTitle(value: number, desc: RateProps['tooltips']) {
  const item = desc?.[value - 1];
  return typeof item === 'object' ? item.title : item;
}
</script>
<template>
  <Flex gap="middle" vertical>
    <Rate :tooltips="desc" v-model:value="value" />
    <span v-if="value">{{ getDescTitle(value, desc) }}</span>
  </Flex>
</template>
