<script lang="tsx" setup>
export interface ItemProps {
  setRef: (element: HTMLElement) => void;
}
import { cloneVNode } from 'vue';

const props = defineProps<ItemProps>();

function refFunc(node) {
  props.setRef(node);
}
</script>
<template>
  <component :is="cloneVNode($slots.default?.()[0], { ref: refFunc })" />
</template>
