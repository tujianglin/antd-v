<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <FloatButton.Group shape="circle" class="!end-6">
    <FloatButton :icon="QuestionCircleOutlined" />
    <FloatButton />
    <FloatButton.BackTop :visibility-height="0" />
  </FloatButton.Group>
  <FloatButton.Group shape="circle" class="!end-22">
    <FloatButton :icon="QuestionCircleOutlined" />
    <FloatButton />
    <FloatButton :icon="SyncOutlined" />
    <FloatButton.BackTop :visibility-height="0" />
  </FloatButton.Group>
</template>
