<script lang="tsx" setup>
import { InputNumber } from '@/components';
import { UserOutlined } from '@ant-design/icons-vue';
import { effect, ref } from 'vue';

const value = ref(99);
effect(() => {
  console.log(value.value);
});
</script>
<template>
  <InputNumber prefix="￥" class="!w-full" />
  <br />
  <br />
  <InputNumber :addon-before="UserOutlined" prefix="￥" class="!w-full" />
  <br />
  <br />
  <InputNumber prefix="￥" disabled class="!w-full" />
  <br />
  <br />
  <InputNumber suffix="RMB" class="!w-full" />
</template>
