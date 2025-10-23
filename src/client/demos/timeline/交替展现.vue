<script lang="tsx" setup>
import { Timeline } from '@/components';
import { ClockCircleOutlined } from '@ant-design/icons-vue';

const items = [
  {
    content: 'Create a services site 2015-09-01',
  },
  {
    content: 'Solve initial network problems 2015-09-01',
    color: 'green',
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
    content: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
  },
  {
    color: 'red',
    content: 'Network problems being solved 2015-09-01',
  },
  {
    content: 'Create a services site 2015-09-01',
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
    content: 'Technical testing 2015-09-01',
  },
];
</script>
<template>
  <Timeline mode="alternate" :items="items" />
</template>
