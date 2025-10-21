<script lang="tsx" setup>
import { Button, Flex } from '@/components';
import { PoweroffOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { h, ref } from 'vue';

const loadings = ref<boolean[]>([]);

const enterLoading = (index: number) => {
  console.log('Start loading:', index);

  const newLoadings = [...loadings.value];
  newLoadings[index] = true;
  loadings.value = newLoadings;

  setTimeout(() => {
    const newLoadings = [...loadings.value];
    newLoadings[index] = false;
    loadings.value = newLoadings;
  }, 3000);
};
</script>
<template>
  <Flex gap="small" vertical>
    <Flex gap="small" align="center" wrap>
      <Button type="primary" loading> Loading </Button>
      <Button type="primary" size="small" loading> Loading </Button>
      <Button type="primary" :icon="PoweroffOutlined" loading />
      <Button type="primary" :loading="{ icon: h(SyncOutlined, { spin: true }) }"> Loading Icon </Button>
    </Flex>
    <Flex gap="small" wrap>
      <Button type="primary" :loading="loadings[0]" @click="() => enterLoading(0)"> Icon Start </Button>
      <Button type="primary" :loading="loadings[2]" @click="() => enterLoading(2)" icon-position="end"> Icon End </Button>
      <Button type="primary" :icon="PoweroffOutlined" :loading="loadings[1]" @click="() => enterLoading(1)">
        Icon Replace
      </Button>
      <Button type="primary" :icon="PoweroffOutlined" :loading="loadings[3]" @click="() => enterLoading(3)" />
      <Button
        type="primary"
        :icon="PoweroffOutlined"
        :loading="loadings[3] && { icon: h(SyncOutlined, { spin: true }) }"
        @click="() => enterLoading(3)"
      >
        Loading Icon
      </Button>
    </Flex>
  </Flex>
</template>
