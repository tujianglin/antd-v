<script lang="tsx" setup>
import { Breadcrumb } from '@/components';
import { h } from 'vue';

const menuItems = [
  {
    key: '1',
    label: <div>General</div>,
  },
  {
    key: '2',
    label: <div>Layout</div>,
  },
  {
    key: '3',
    label: <div>Navigation</div>,
  },
];
</script>
<template>
  <Breadcrumb
    :items="[
      {
        title: 'Ant Design',
      },
      {
        title: h('a', { href: '' }, 'Components'),
      },
      {
        title: h('a', { href: '' }, 'General'),
        menu: { items: menuItems },
        dropdownProps: {},
      },
      {
        title: 'Button',
      },
    ]"
  />
</template>
