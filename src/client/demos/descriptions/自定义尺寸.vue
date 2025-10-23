<script lang="tsx" setup>
import { Button, Descriptions, Radio, type DescriptionsProps } from '@/components';
import { h, ref } from 'vue';

const borderedItems: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Product',
    children: 'Cloud Database',
  },
  {
    key: '2',
    label: 'Billing',
    children: 'Prepaid',
  },
  {
    key: '3',
    label: 'Time',
    children: '18:00:00',
  },
  {
    key: '4',
    label: 'Amount',
    children: '$80.00',
  },
  {
    key: '5',
    label: 'Discount',
    children: '$20.00',
  },
  {
    key: '6',
    label: 'Official',
    children: '$60.00',
  },
  {
    key: '7',
    label: 'Config Info',
    children: () => (
      <>
        Data disk type: MongoDB
        <br />
        Database version: 3.4
        <br />
        Package: dds.mongo.mid
        <br />
        Storage space: 10 GB
        <br />
        Replication factor: 3
        <br />
        Region: East China 1
        <br />
      </>
    ),
  },
];

const items: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Product',
    children: 'Cloud Database',
  },
  {
    key: '2',
    label: 'Billing',
    children: 'Prepaid',
  },
  {
    key: '3',
    label: 'Time',
    children: '18:00:00',
  },
  {
    key: '4',
    label: 'Amount',
    children: '$80.00',
  },
  {
    key: '5',
    label: 'Discount',
    children: '$20.00',
  },
  {
    key: '6',
    label: 'Official',
    children: '$60.00',
  },
];

const size = ref<'default' | 'middle' | 'small'>('middle');
</script>
<template>
  <div>
    <Radio.Group
      v-model:value="size"
      :options="[
        { label: 'small', value: 'small' },
        { label: 'middle', value: 'middle' },
        { label: 'large', value: 'large' },
      ]"
    >
      >
    </Radio.Group>
    <br />
    <br />
    <Descriptions
      bordered
      title="Custom Size"
      :size="size"
      :extra="h(Button, { type: 'primary' }, () => 'Edit')"
      :items="borderedItems"
    />
    <br />
    <br />
    <Descriptions title="Custom Size" :size="size" :extra="h(Button, { type: 'primary' }, () => 'Edit')" :items="items" />
  </div>
</template>
