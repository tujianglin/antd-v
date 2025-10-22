<script lang="tsx" setup>
import { Button, TimePicker } from '@/components';
import { ref } from 'vue';

const open = ref(false);

const renderExtraFooter = () => (
  <Button size="small" type="primary" onClick={() => (open.value = false)}>
    OK
  </Button>
);
</script>
<template>
  <TimePicker :open="open" @open-change="(v) => (open = v)" :render-extra-footer="renderExtraFooter" />
</template>
