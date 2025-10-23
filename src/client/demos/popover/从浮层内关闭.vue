<script lang="tsx" setup>
import { Button, Popover } from '@/components';
import { ref } from 'vue';

const open = ref(false);

const hide = () => {
  open.value = false;
};

const handleOpenChange = (newOpen: boolean) => {
  open.value = newOpen;
};
const content = <a onClick={hide}>Close</a>;
</script>
<template>
  <Popover :content="content" title="Title" trigger="click" :open="open" @open-change="handleOpenChange">
    <Button type="primary">Click me</Button>
  </Popover>
</template>
