<script lang="tsx" setup>
import { Button, ConfigProvider } from '@/components';
import { ref } from 'vue';

const colorPrimary = ref('#bae637');

function onClick() {
  colorPrimary.value = colorPrimary.value === '#bae637' ? '#00ff00' : '#bae637';
}
</script>
<template>
  <ConfigProvider :wave="{ disabled: true }">
    <Button type="primary" @click="onClick">默认按钮</Button>
  </ConfigProvider>
</template>
