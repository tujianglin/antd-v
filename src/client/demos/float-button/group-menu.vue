<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { CommentOutlined, CustomerServiceOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <FloatButton.Group trigger="click" type="primary" class="!end-6" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
  <FloatButton.Group trigger="hover" type="primary" class="!end-22" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
</template>
