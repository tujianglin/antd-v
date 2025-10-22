<script lang="tsx" setup>
import type { TransferProps } from '@/components';
import { Switch, Transfer } from '@/components';
import { onMounted, ref } from 'vue';

const targetKeys = ref();
const mockData = ref([]);
const oneWay = ref(false);

const getMock = () => {
  const tempTargetKeys = [];
  const tempMockData = [];
  for (let i = 0; i < 500; i++) {
    const data = {
      key: i.toString(),
      title: `content${i + 1}`,
      description: `description of content${i + 1}`,
      chosen: i % 2 === 0,
    };
    if (data.chosen) {
      tempTargetKeys.push(data.key);
    }
    tempMockData.push(data);
  }
  mockData.value = tempMockData;
  targetKeys.value = tempTargetKeys;
};

onMounted(() => {
  getMock();
});

const onChange: TransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
  console.log('targetKeys:', nextTargetKeys);
  console.log('direction:', direction);
  console.log('moveKeys:', moveKeys);
};
</script>
<template>
  <Transfer
    :data-source="mockData"
    v-model:target-keys="targetKeys"
    @change="onChange"
    :render="(item) => `${item.title}`"
    :one-way="oneWay"
    pagination
  />
  <Switch un-checked-children="one way" checked-children="one way" v-model:checked="oneWay" />
</template>
