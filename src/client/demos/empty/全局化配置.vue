<script lang="tsx" setup>
import { Cascader, ConfigProvider, Divider, Select, Space, Switch, Transfer, TreeSelect } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';
import { ref, type CSSProperties } from 'vue';

const customizeRenderEmpty = () => (
  <div style={{ textAlign: 'center' }}>
    <SmileOutlined style={{ fontSize: `${20}px` }} />
    <p>Data Not Found</p>
  </div>
);

const customize = ref(false);

const style: CSSProperties = { width: `${200}px` };
</script>
<template>
  <Switch un-checked-children="default" checked-children="customize" v-model:checked="customize" />
  <Divider />
  <ConfigProvider :render-empty="customize ? customizeRenderEmpty : undefined">
    <Space vertical class="!w-full">
      <h4>Select</h4>
      <Select :style="style" />
      <h4>TreeSelect</h4>
      <TreeSelect :style="style" :tree-data="[]" />
      <h4>Cascader</h4>
      <Cascader :style="style" :options="[]" show-search />
      <h4>Transfer</h4>
      <Transfer />
    </Space>
  </ConfigProvider>
</template>
