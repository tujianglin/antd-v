<script lang="tsx" setup>
import type { StepsProps } from '@/components';
import { Card, Radio, Steps } from '@/components';
import { ref } from 'vue';

const size = ref<StepsProps['size']>('default');
const content = 'This is a content.';
const horizontalSteps = () => (
  <Card>
    <Steps
      size={size.value}
      items={[
        {
          title: 'Finished',
          content,
        },
        {
          title: 'In Progress',
          content,
        },
        {
          title: 'Waiting',
          content,
        },
      ]}
    />
  </Card>
);
</script>
<template>
  <Radio.Group class="!mb-4" v-model:value="size">
    <Radio value="small">Small</Radio>
    <Radio value="default">Default</Radio>
  </Radio.Group>
  <Steps
    :size="size"
    orientation="vertical"
    :items="[
      {
        title: 'Finished',
        content: horizontalSteps,
      },
      {
        title: 'In Progress',
        content,
      },
      {
        title: 'Waiting',
        content,
      },
    ]"
  />
</template>
