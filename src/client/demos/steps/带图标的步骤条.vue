<script lang="tsx" setup>
import { Steps, type StepsProps } from '@/components';
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons-vue';

const items: StepsProps['items'] = [
  {
    title: 'Login',
    status: 'finish',
    icon: <UserOutlined />,
  },
  {
    title: 'Verification',
    status: 'finish',
    icon: <SolutionOutlined />,
  },
  {
    title: 'Pay',
    status: 'process',
    icon: <LoadingOutlined />,
  },
  {
    title: 'Done',
    status: 'wait',
    icon: <SmileOutlined />,
  },
];
</script>
<template>
  <Steps :items="items" />
</template>
