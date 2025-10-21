<script lang="tsx" setup>
import { Button, Dropdown, Flex, Space, type MenuProps } from '@/components';
import { EllipsisOutlined } from '@ant-design/icons-vue';

const onMenuClick: MenuProps['onClick'] = (e) => {
  console.log('click', e);
};

const items = [
  {
    key: '1',
    label: '1st item',
  },
  {
    key: '2',
    label: '2nd item',
  },
  {
    key: '3',
    label: '3rd item',
  },
];
</script>
<template>
  <Flex align="flex-start" gap="small" vertical>
    <Button type="primary">primary</Button>
    <Button>secondary</Button>
    <Space.Compact>
      <Button>Actions</Button>
      <Dropdown :menu="{ items, onClick: onMenuClick }">
        <Button :icon="EllipsisOutlined" />
      </Dropdown>
    </Space.Compact>
  </Flex>
</template>
