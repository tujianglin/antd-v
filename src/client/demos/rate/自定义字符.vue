<script lang="tsx" setup>
import { Flex, Rate } from '@/components';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons-vue';

const customIcons: Record<number, any> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};
</script>
<template>
  <Flex gap="middle" vertical>
    <Rate :value="2" :character="({ index = 0 }) => index + 1" />
    <Rate :value="3" :character="({ index = 0 }) => customIcons[index + 1]" />
  </Flex>
</template>
