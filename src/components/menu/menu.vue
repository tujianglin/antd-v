<script lang="tsx" setup>
import { ref } from 'vue';
import type { MenuRef } from '.';
import { useSiderContextInject } from '../layout/context';
import type { MenuProps } from './InternalMenu.vue';
import InternalMenu from './InternalMenu.vue';

defineOptions({ name: 'Menu', inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<MenuProps>();

const selectedKeys = defineModel<any[]>('selectedKeys');
const openKeys = defineModel('openKeys', { default: [] });

const menuRef = ref<MenuRef>();
const context = useSiderContextInject();

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
    v-bind="{ ...$props, ...context }"
    v-model:selected-keys="selectedKeys"
    v-model:open-keys="openKeys"
  />
</template>
