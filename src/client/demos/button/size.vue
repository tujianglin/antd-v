<script lang="tsx" setup>
import { Button, Divider, Flex, Radio, type ConfigProviderProps } from '@/components';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

type SizeType = ConfigProviderProps['componentSize'];

const size = ref<SizeType>('large');
</script>
<template>
  <Radio.Group
    v-model:value="size"
    option-type="button"
    :options="[
      { label: 'Large', value: 'large' },
      { label: 'Default', value: 'default' },
      { label: 'Small', value: 'small' },
    ]"
  />
  <Divider title-placement="start" :styles="{ content: { margin: '16px' } }" plain> Preview </Divider>
  <Flex gap="small" align="flex-start" vertical>
    <Flex gap="small" wrap>
      <Button type="primary" :size="size"> Primary </Button>
      <Button :size="size">Default</Button>
      <Button type="dashed" :size="size"> Dashed </Button>
    </Flex>
    <Button type="link" :size="size"> Link </Button>
    <Flex gap="small" wrap>
      <Button type="primary" :icon="DownloadOutlined" :size="size" />
      <Button type="primary" shape="circle" :icon="DownloadOutlined" :size="size" />
      <Button type="primary" shape="round" :icon="DownloadOutlined" :size="size" />
      <Button type="primary" shape="round" :icon="DownloadOutlined" :size="size"> Download </Button>
      <Button type="primary" :icon="DownloadOutlined" :size="size"> Download </Button>
    </Flex>
  </Flex>
</template>
