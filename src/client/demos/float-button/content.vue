<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { FileTextOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <FloatButton :icon="FileTextOutlined" content="HELP INFO" shape="square" :style="{ insetInlineEnd: '24px' }" />
  <FloatButton content="HELP INFO" shape="square" :style="{ insetInlineEnd: '94px' }" />
  <FloatButton :icon="FileTextOutlined" content="HELP" shape="square" :style="{ insetInlineEnd: '164px' }" />
</template>
