<script lang="tsx" setup>
import {} from 'vue';
import type { MenuItemGroupType } from './interface';

export interface MenuItemGroupProps extends Omit<MenuItemGroupType, 'type' | 'label'> {
  title?: any;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

defineProps<MenuItemGroupProps>();
</script>
<template>
  <div></div>
</template>
