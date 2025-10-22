<script lang="tsx" setup>
import type { TransferProps } from '@/components';
import { Button, Transfer } from '@/components';
import { onMounted, ref } from 'vue';

const targetKeys = ref();
const mockData = ref([]);

const getMock = () => {
  const tempTargetKeys = [];
  const tempMockData = [];
  for (let i = 0; i < 20; i++) {
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

const renderFooter: TransferProps['footer'] = (_, info) => {
  if (info?.direction === 'left') {
    return () => (
      <Button size="small" style={{ display: 'flex', margin: `${8}px`, marginInlineEnd: 'auto' }} onClick={getMock}>
        Left button reload
      </Button>
    );
  }
  return () => (
    <Button size="small" style={{ display: 'flex', margin: `${8}px`, marginInlineStart: 'auto' }} onClick={getMock}>
      Right button reload
    </Button>
  );
};
</script>
<template>
  <Transfer
    show-search
    :styles="{
      section: {
        width: `${250}px`,
        height: `${300}px`,
      },
    }"
    :data-source="mockData"
    :actions="['to right', 'to left']"
    v-model:target-keys="targetKeys"
    @change="onChange"
    :render="(item) => `${item.title}-${item.description}`"
    :footer="renderFooter"
  />
</template>
