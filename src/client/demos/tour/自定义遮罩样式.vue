<script lang="tsx" setup>
import { Button, Divider, Space, Tour, type TourProps } from '@/components';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import { ref, useTemplateRef } from 'vue';

const ref1 = useTemplateRef<HTMLDivElement>('ref1');
const ref2 = useTemplateRef<HTMLDivElement>('ref2');
const ref3 = useTemplateRef<HTMLDivElement>('ref3');

const open = ref<boolean>(false);

const steps: TourProps['steps'] = [
  {
    title: 'Upload File',
    description: 'Put your files here.',
    target: () => ref1.value!,
  },
  {
    title: 'Save',
    description: 'Save your changes.',
    target: () => ref2.value!,
  },
  {
    title: 'Other Actions',
    description: 'Click to see other actions.',
    target: () => ref3.value!,
  },
];
</script>
<template>
  <Button type="primary" @click="() => (open = true)"> Begin Tour </Button>
  <Divider />
  <Space>
    <Button ref="ref1">Upload</Button>
    <Button ref="ref2" type="primary"> Save </Button>
    <Button ref="ref3" :icon="EllipsisOutlined" />
  </Space>
  <Tour
    :open="open"
    @close="() => (open = false)"
    :steps="steps"
    :mask="{
      style: {
        boxShadow: 'inset 0 0 15px #333',
      },
      color: 'rgba(80, 255, 255, .4)',
    }"
  />
</template>
