<script lang="tsx" setup>
import type { RadioChangeEvent, TabsProps } from '@/components';
import { Radio, Tabs } from '@/components';
import { ref } from 'vue';

const mode = ref<TabsProps['tabPlacement']>('top');

const handleModeChange = (e: RadioChangeEvent) => {
  mode.value = e.target.value;
};
</script>
<template>
  <div>
    <Radio.Group
      @change="{ handleModeChange }"
      v-model:value="mode"
      class="!mb-2"
      :options="[
        {
          label: 'Horizontal',
          value: 'top',
        },
        {
          label: 'Vertical',
          value: 'left',
        },
      ]"
    />
    <Tabs
      default-active-key="1"
      :tab-placement="mode"
      :style="{ height: `${220}px` }"
      :items="
        Array.from({ length: 30 }, (_, i) => {
          const id = String(i);
          return {
            label: `Tab-${id}`,
            key: id,
            disabled: i === 28,
            children: `Content of tab ${id}`,
          };
        })
      "
    />
  </div>
</template>
