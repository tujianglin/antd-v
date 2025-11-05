<script lang="tsx" setup>
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from '@/components';
import { Menu } from '@/components';
import { ref } from 'vue';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    label: 'Navigation One',
    key: 'mail',
    icon: <MailOutlined />,
  },
  {
    label: 'Navigation Two',
    key: 'app',
    icon: <AppstoreOutlined />,
    disabled: true,
  },
  {
    label: 'Navigation Three - Submenu',
    key: 'SubMenu',
    icon: <SettingOutlined />,
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          { label: 'Option 1', key: 'setting:1' },
          { label: 'Option 2', key: 'setting:2' },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          { label: 'Option 3', key: 'setting:3' },
          { label: 'Option 4', key: 'setting:4' },
        ],
      },
    ],
  },
  {
    key: 'alipay',
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        Navigation Four - Link
      </a>
    ),
  },
];

const current = ref(['mail']);

const onClick: MenuProps['onClick'] = (e) => {
  console.log('click ', e);
};
</script>
<template>
  <Menu @click="onClick" :selected-keys="current" mode="horizontal" :items="items" />
</template>
