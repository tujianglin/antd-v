<script lang="tsx" setup>
import { FloatButton, Switch } from '@/components';
import { CommentOutlined, CustomerServiceOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const open = ref(true);
</script>
<template>
  <Switch v-model:checked="open" class="m-4" />
  <FloatButton.Group :open="open" trigger="click" class="!end-6" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
  <FloatButton.Group :open="open" shape="square" trigger="click" class="!end-22" :icon="CustomerServiceOutlined">
    <FloatButton />
    <FloatButton />
    <FloatButton :icon="CommentOutlined" />
  </FloatButton.Group>
</template>
