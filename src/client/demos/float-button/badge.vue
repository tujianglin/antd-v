<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
</script>
<template>
  <FloatButton shape="circle" :style="{ insetInlineEnd: `${24 + 70 + 70}px` }" :badge="{ dot: true }" />
  <FloatButton.Group shape="circle" :style="{ insetInlineEnd: `${24 + 70}px` }">
    <FloatButton
      href="https://ant.design/index-cn"
      :tooltip="h('div', {}, 'custom badge color')"
      :badge="{ count: 5, color: 'blue' }"
    />
    <FloatButton :badge="{ count: 5 }" />
  </FloatButton.Group>
  <FloatButton.Group shape="circle">
    <FloatButton :badge="{ count: 12 }" :icon="QuestionCircleOutlined" />
    <FloatButton :badge="{ count: 123, overflowCount: 999 }" />
    <FloatButton.BackTop :visibility-height="0" />
  </FloatButton.Group>
</template>
