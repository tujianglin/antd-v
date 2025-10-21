<script lang="tsx" setup>
import { Button, Checkbox, Divider, Tabs } from '@/components';
import type { VueNode } from '@/vc-util/type';
import { computed, ref } from 'vue';

const CheckboxGroup = Checkbox.Group;

const operations = <Button>Extra Action</Button>;

const OperationsSlot: Record<PositionType, VueNode> = {
  left: <Button class="tabs-extra-demo-button">Left Extra Action</Button>,
  right: <Button>Right Extra Action</Button>,
};

const options = ['left', 'right'];

type PositionType = 'left' | 'right';

const items = Array.from({ length: 3 }).map((_, i) => {
  const id = String(i + 1);
  return {
    label: `Tab ${id}`,
    key: id,
    children: `Content of tab ${id}`,
  };
});

const position = ref<PositionType[]>(['left', 'right']);

const slot = computed(() => {
  if (position.value.length === 0) {
    return null;
  }
  return position.value.reduce((acc, direction) => ({ ...acc, [direction]: OperationsSlot[direction] }), {});
});
</script>
<template>
  <Tabs :tab-bar-extra-content="operations" :items="items" />
  <br />
  <br />
  <br />
  <div>You can also specify its direction or both side</div>
  <Divider />
  <CheckboxGroup :options="options" v-model:value="position" />
  <br />
  <br />
  <Tabs :tab-bar-extra-content="slot" :items="items" />
</template>
