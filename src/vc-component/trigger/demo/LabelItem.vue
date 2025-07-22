<script lang="tsx" setup>
import { omit } from 'lodash-es';
import { cloneVNode, computed, useSlots } from 'vue';

const props = defineProps<{ title?: string }>();

const slots = useSlots();

const children = computed(() => slots.default?.()[0]);

const style = {
  display: 'inline-flex',
  padding: '0 8px',
  alignItems: 'center',
};

const spacing = <span style={{ width: '4px' }} />;
</script>
<template>
  <label v-if="children.type === 'input' && children.props?.type === 'checkbox'" :style="style">
    <component :is="cloneVNode(children, { ...omit(props, ['title']), ...$attrs })" />
    <component :is="spacing" />
    {{ props.title }}
  </label>
  <label v-else :style="style">
    {{ props.title }}
    <component :is="spacing" />
    <component :is="cloneVNode(children, { ...omit(props, ['title']), ...$attrs })" />
  </label>
</template>
