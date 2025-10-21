<script lang="tsx" setup>
import type { TabsProps } from '@/components';
import { Radio, Tabs } from '@/components';
import { ref } from 'vue';

type TargetKey = MouseEvent | KeyboardEvent | string;

const size = ref<'small' | 'middle' | 'large'>('small');
const activeKey = ref('1');
const items = ref<TabsProps['items']>([
  {
    label: 'Tab 1',
    key: '1',
    children: 'Content of editable tab 1',
  },
  {
    label: 'Tab 2',
    key: '2',
    children: 'Content of editable tab 2',
  },
  {
    label: 'Tab 3',
    key: '3',
    children: 'Content of editable tab 3',
  },
]);

const add = () => {
  const newKey = String((items.value || []).length + 1);
  items.value = [
    ...(items.value || []),
    {
      label: `Tab ${newKey}`,
      key: newKey,
      children: `Content of editable tab ${newKey}`,
    },
  ];
  activeKey.value = newKey;
};

const remove = (targetKey: TargetKey) => {
  if (!items.value) return;
  const targetIndex = items.value.findIndex((item) => item.key === targetKey);
  const newItems = items.value.filter((item) => item.key !== targetKey);

  if (newItems.length && targetKey === activeKey.value) {
    const newActiveKey = newItems[targetIndex === newItems.length ? targetIndex - 1 : targetIndex].key;
    activeKey.value = newActiveKey;
  }

  items.value = newItems;
};

const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
  if (action === 'add') {
    add();
  } else {
    remove(targetKey);
  }
};
</script>
<template>
  <div>
    <Radio.Group
      v-model:value="size"
      class="!mb-2"
      :options="[
        { label: 'small', value: 'small' },
        { label: 'middle', value: 'middle' },
        { label: 'large', value: 'large' },
      ]"
    />
    <Tabs
      active-key="1"
      :size="size"
      class="!mb-8"
      :items="
        Array.from({ length: 3 }).map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Tab ${id}`,
            key: id,
            children: `Content of tab ${id}`,
          };
        })
      "
    />
    <Tabs
      active-key="1"
      type="card"
      :size="size"
      class="!mb-8"
      :items="
        Array.from({ length: 3 }).map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Card Tab ${id}`,
            key: id,
            children: `Content of card tab ${id}`,
          };
        })
      "
    />
    <Tabs
      type="editable-card"
      :size="size"
      :active-key="activeKey"
      @change="(e) => (activeKey = e)"
      @edit="onEdit"
      :items="items"
    />
  </div>
</template>
