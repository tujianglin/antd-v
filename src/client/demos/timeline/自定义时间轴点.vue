<script lang="tsx" setup>
import { theme, Timeline, type TimelineProps } from '@/components';
import { ClockCircleOutlined } from '@ant-design/icons-vue';

const { token } = theme.useToken();

const sharedProps: TimelineProps = {
  items: [
    {
      content: 'Create a services site 2015-09-01',
    },
    {
      content: 'Solve initial network problems 2015-09-01',
    },
    {
      icon: (
        <ClockCircleOutlined
          style={{
            fontSize: `${20}px`,
            // Only need to set when `fontSize` is customized
            background: token.value.colorBgContainer,
          }}
        />
      ),
      color: 'red',
      content: 'Technical testing 2015-09-01',
    },
    {
      content: 'Network problems being solved 2015-09-01',
    },
  ],
};
</script>
<template>
  <Timeline v-bind="sharedProps" />
</template>
