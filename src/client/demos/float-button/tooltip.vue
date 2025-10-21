<script lang="tsx" setup>
import { FloatButton } from '@/components';
import { h } from 'vue';
</script>
<template>
  <FloatButton
    :tooltip="{
      // tooltipProps is supported starting from version 5.25.0.
      title: 'Since 5.25.0+',
      color: 'blue',
      placement: 'top',
    }"
    class="!end-6"
  />
  <FloatButton :tooltip="h('div', {}, 'Documents')" class="!end-22" />
</template>
