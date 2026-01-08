<script setup lang="ts">
import { ColorPicker, ConfigProvider, Radio, theme } from '@/components';
import 'dayjs/locale/zh-cn';
import { ref } from 'vue';

const isDark = ref(true);
const color = ref('#ffffff');
</script>

<template>
  <ConfigProvider
    :theme="{
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: color,
      },
    }"
  >
    <Radio.Group
      v-model:value="isDark"
      option-type="button"
      :options="[
        {
          label: '暗色',
          value: true,
        },
        {
          label: '亮色',
          value: false,
        },
      ]"
    />
    <ColorPicker v-model:value="color" />
  </ConfigProvider>
</template>
