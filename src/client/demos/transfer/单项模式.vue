<script lang="tsx" setup>
import type { TransferProps } from '@/components';
import { Switch, Transfer } from '@/components';
import { ref } from 'vue';

interface RecordType {
  key: string;
  title: string;
  description: string;
}

const mockData = Array.from({ length: 20 }).map<RecordType>((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
}));

const initialTargetKeys = mockData.filter((item) => Number(item.key) > 10).map((item) => item.key);

const targetKeys = ref(initialTargetKeys);
const selectedKeys = ref([]);
const disabled = ref(false);

const onChange: TransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
  console.log('targetKeys:', nextTargetKeys);
  console.log('direction:', direction);
  console.log('moveKeys:', moveKeys);
};

const onSelectChange: TransferProps['onSelectChange'] = (sourceSelectedKeys, targetSelectedKeys) => {
  console.log('sourceSelectedKeys:', sourceSelectedKeys);
  console.log('targetSelectedKeys:', targetSelectedKeys);
};

const onScroll: TransferProps['onScroll'] = (direction, e) => {
  console.log('direction:', direction);
  console.log('target:', e.target);
};
</script>
<template>
  <Transfer
    class="!mb-4"
    :data-source="mockData"
    :titles="['Source', 'Target']"
    v-model:target-keys="targetKeys"
    v-model:selected-keys="selectedKeys"
    @change="onChange"
    @select-change="onSelectChange"
    @scroll="onScroll"
    :render="(item) => item.title"
    :disabled="disabled"
    one-way
  />
  <Switch un-checked-children="disabled" checked-children="disabled" v-model:checked="disabled" />
</template>
