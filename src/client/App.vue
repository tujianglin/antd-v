<script lang="tsx" setup>
import { Button, Dropdown } from '@/components';
import type { DropdownProps } from '@/components/dropdown/interface';
import { Icon } from '@iconify/vue';

const items: DropdownProps['menu']['items'] = [
  {
    key: '1',
    type: 'group',
    label: 'Group title',
    children: [
      {
        key: '1-1',
        type: 'group',
        label: '1st menu item',
        children: [
          {
            key: '1-1-1',
            label: '3rd menu item',
          },
          {
            key: '44444',
            type: 'divider',
          },
          {
            key: '1-1-2',
            label: '4th menu item',
          },
        ],
      },
      {
        key: '1-111',
        type: 'item',
        label: '2nd menu item',
        icon: <Icon icon="line-md:loading-loop"></Icon>,
      },
      {
        key: '2',
        label: 'sub menu',
        children: [
          {
            key: '2-1',
            label: '3rd menu item',
            children: [
              {
                key: '3-1',
                label: '3rd menu item',
              },
              {
                key: '3-2',
                label: '4th menu item',
              },
              {
                key: '3-3',
                type: 'group',
                label: '1st menu item',
                children: [
                  {
                    key: '3-3-1',
                    label: '3rd menu item',
                  },
                  {
                    key: '3-3-2',
                    label: '4th menu item',
                  },
                ],
              },
            ],
          },
          {
            key: '2-2',
            label: '4th menu item',
          },
        ],
      },
      {
        key: '1-2',
        label: '2nd menu item',
      },
    ],
  },
  {
    key: '33333',
    type: 'divider',
  },
  {
    key: '3',
    label: 'disabled sub menu',
    disabled: true,
    children: [
      {
        key: '3-1',
        label: '5d menu item',
      },
      {
        key: '3-2',
        label: '6th menu item',
      },
    ],
  },
];
</script>
<template>
  <Dropdown :menu="{ items }">
    <Button>1</Button>
  </Dropdown>
</template>
