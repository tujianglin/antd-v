<script lang="tsx" setup>
import type { StepsProps } from '@/components';
import { Flex, Steps, theme } from '@/components';

const items: StepsProps['items'] = Array.from({ length: 5 }, (_, index) => ({
  title: `Step ${index + 1}`,
  subTitle: 'Sub Title',
  content: `This is Step ${index + 1}`,
}));

const { token } = theme.useToken();
</script>
<template>
  <Flex vertical>
    <Steps type="inline" :current="1" :items="items" />
    <Steps
      type="inline"
      :current="4"
      :items="items"
      status="finish"
      :styles="{
        itemTitle: {
          color: token.colorPrimaryText,
        },
        itemSubtitle: {
          color: token.colorPrimaryTextActive,
        },
        itemRail: {
          background: token.colorTextDisabled,
        },
      }"
    />
    <Steps type="inline" :current="1" :items="items.slice(2)" :offset="2" />
  </Flex>
</template>
