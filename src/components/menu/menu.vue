<script lang="tsx" setup>
import { useTemplateRef } from 'vue';
import { useSiderContextInject } from '../layout/context';
import type { MenuProps } from './InternalMenu.vue';
import InternalMenu from './InternalMenu.vue';

defineOptions({ name: 'Menu', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { onClick, ...resetProps } = defineProps<MenuProps>();

const selectedKeys = defineModel<any[]>('selectedKeys');
const openKeys = defineModel('openKeys', { default: [] });

const menuRef = useTemplateRef<HTMLDivElement>('menuRef');
const context = useSiderContextInject();

function handleClick(e) {
  if (selectedKeys.value?.length) {
    selectedKeys.value = [e.key];
  }
  onClick?.(e);
}

defineExpose({
  get menu() {
    return menuRef.value;
  },
  focus: (options) => {
    menuRef.value?.focus(options);
  },
});
</script>
<template>
  <InternalMenu
    ref="menuRef"
    v-bind="{ ...resetProps, ...context }"
    v-model:selected-keys="selectedKeys"
    v-model:open-keys="openKeys"
    @click="handleClick"
  />
</template>
