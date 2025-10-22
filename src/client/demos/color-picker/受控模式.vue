<script lang="tsx" setup>
import { ColorPicker, Space } from '@/components';
import { DownOutlined } from '@ant-design/icons-vue';
import { h, ref } from 'vue';

const open = ref(false);
</script>
<template>
  <Space vertical>
    <ColorPicker value="#1677ff" show-text allow-clear />
    <ColorPicker value="#1677ff" :show-text="(color) => h('span', {}, `Custom Text (${color.toHexString()})`)" />
    <ColorPicker
      value="#1677ff"
      :open="open"
      @open-change="() => (open = true)"
      :show-text="() => h(DownOutlined, { rotate: open ? 180 : 0, style: { color: 'rgba(0, 0, 0, 0.25)' } })"
    />
  </Space>
</template>
