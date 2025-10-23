<script lang="tsx" setup>
import { Flex, Segmented } from '@/components';
import { MobileOutlined, SoundOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const size = ref<'small' | 'middle' | 'large'>('middle');
</script>
<template>
  <Flex gap="small" align="flex-start" vertical>
    <Segmented :options="['small', 'middle', 'large']" v-model:value="size" />
    <Segmented
      :size="size"
      shape="round"
      :options="[
        { value: 'light', icon: SoundOutlined },
        { value: 'dark', icon: MobileOutlined },
      ]"
    />
  </Flex>
</template>
