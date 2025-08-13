<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { CommentOutlined, CustomerServiceOutlined } from '@ant-design/icons-vue';
import {} from 'vue';
</script>
<template>
  <FloatButton.Group trigger="hover" type="primary" :style="{ insetInlineEnd: `${24}px` }" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
  <FloatButton.Group trigger="click" type="primary" :style="{ insetInlineEnd: `${94}px` }" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
</template>
