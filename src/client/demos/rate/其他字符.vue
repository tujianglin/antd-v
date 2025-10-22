<script lang="tsx" setup>
import { Flex, Rate } from '@/components';
import { HeartOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Flex vertical gap="middle">
    <Rate :character="() => HeartOutlined" allow-half />
    <Rate character="A" allow-half :style="{ fontSize: `${36}px` }" />
    <Rate character="好" allow-half />
  </Flex>
</template>
