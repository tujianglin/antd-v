<script lang="tsx" setup>
import { Button, ConfigProvider } from '@/components';
import { ref } from 'vue';

const colorPrimary = ref('#bae637');

const loading = ref(false);

const type1 = ref('primary');

function onClick() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 3000);
  colorPrimary.value = colorPrimary.value === '#bae637' ? '#00ff00' : '#bae637';
}
</script>
<template>
  <ConfigProvider>
    <Button type="primary" @click="onClick" :loading="loading">默认按钮</Button>
    <ConfigProvider :theme="{ token: { colorPrimary: '#00ff00' } }">
      <Button
        type="primary"
        @click="
          () => {
            type1 = 'default';
          }
        "
      >
        默认按钮
      </Button>
    </ConfigProvider>
  </ConfigProvider>
</template>
