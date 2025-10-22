<script lang="tsx" setup>
import { InputNumber, Space, type InputNumberProps } from '@/components';
import { ref } from 'vue';

const value = ref(3);
const onChange: InputNumberProps['onChange'] = (value) => {
  console.log('changed', value);
};
</script>
<template>
  <Space wrap>
    <InputNumber size="large" :min="1" :max="100000" v-model:value="value" @change="onChange" />
    <InputNumber :min="1" :max="100000" v-model:value="value" @change="onChange" />
    <InputNumber size="small" :min="1" :max="100000" v-model:value="value" @change="onChange" />
  </Space>
</template>
