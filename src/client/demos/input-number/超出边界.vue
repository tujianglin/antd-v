<script lang="tsx" setup>
import { Button, InputNumber, Space } from '@/components';
import { effect, ref } from 'vue';

const value = ref(99);
effect(() => {
  console.log(value.value);
});
</script>
<template>
  <Space>
    <InputNumber :min="1" :max="10" v-model:value="value" />
    <Button type="primary" @click="() => (value = 99)"> Reset </Button>
  </Space>
</template>
