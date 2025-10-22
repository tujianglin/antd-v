<script lang="tsx" setup>
import { Space, Switch } from '@/components';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const checked = ref(true);
</script>
<template>
  <Space vertical>
    <Switch checked-children="开启" un-checked-children="关闭" v-model:checked="checked" />
    <Switch checked-children="1" un-checked-children="0" />
    <Switch :checked-children="CheckOutlined" :un-checked-children="CloseOutlined" v-model:checked="checked" />
  </Space>
</template>
