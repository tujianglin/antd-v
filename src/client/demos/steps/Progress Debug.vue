<script lang="tsx" setup>
import type { StepsProps } from '@/components';
import { Button, Space, Steps } from '@/components';
import { ref } from 'vue';

const percent = ref<number | undefined>(0);
const current = ref(1);
const status = ref<StepsProps['status']>('process');
const content = 'This is a content.';
const items = [
  {
    title: 'Finished',
    content,
  },
  {
    title: 'In Progress',
    subTitle: 'Left 00:00:08',
    content,
  },
  {
    title: 'Waiting',
    content,
  },
];
</script>
<template>
  <Space.Compact block>
    <Button @click="() => (percent = undefined)">Percentage to undefined</Button>
    <Button
      @click="
        () => {
          const next = (percent ?? 0) + 10;
          percent = next > 100 ? 0 : next;
        }
      "
    >
      Percentage +
    </Button>
    <Button @click="() => (current = (current + 1) % 3)">Current +</Button>
    <Button @click="() => (status = 'wait')">Status Wait</Button>
    <Button @click="() => (status = 'process')">Status Process</Button>
    <Button @click="() => (status = 'finish')">Status Finish</Button>
    <Button @click="() => (status = 'error')">Status Error</Button>
  </Space.Compact>
  <br />
  <Steps :current="current" :percent="percent" :status="status" :items="items" />
  <Steps :current="current" :percent="percent" :status="status" size="small" :items="items" />
  <Steps :current="current" :percent="percent" :status="status" orientation="vertical" :items="items" />
  <Steps :current="current" :percent="percent" :status="status" size="small" orientation="vertical" :items="items" />
  {{ percent }}
</template>
