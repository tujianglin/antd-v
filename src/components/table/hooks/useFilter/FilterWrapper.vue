<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';

export interface FilterDropdownMenuWrapperProps {
  class?: string;
}

const props = defineProps<FilterDropdownMenuWrapperProps>();

const onKeydown = (event) => {
  const { keyCode } = event;
  if (keyCode === KeyCode.ENTER) {
    event.stopPropagation();
  }
};
</script>
<template>
  <div :class="props.class" @click="(e) => e.stopPropagation()" @keydown="onKeydown">
    <slot></slot>
  </div>
</template>
