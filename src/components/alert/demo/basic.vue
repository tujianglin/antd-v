<script lang="tsx" setup>
import { Alert } from '@/components';
import { h } from 'vue';
</script>
<template>
  <Alert
    title="Success Text"
    type="success"
    show-icon
    :closable="{
      closeIcon: () => h('div', {}, '222'),
    }"
    :after-close="
      () => {
        console.log(1111);
      }
    "
  >
    <template #title>111</template>
    <template #action>222</template>
    <template #description>大萨达久啊老师肯德基</template>
    <template #icon>11111</template>
    <template #closeIcon>closeIcon</template>
  </Alert>
</template>
