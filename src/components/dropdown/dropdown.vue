<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/ui/dropdown-menu';
import DropdownItemGroup from './DropdownItemGroup.vue';
import DropdownMenuItem from './DropdownMenuItem.vue';
import DropdownSubMenu from './DropdownSubMenu.vue';
import type { DropdownProps } from './interface';

const { menu } = defineProps<DropdownProps>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot></slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <template v-for="item in menu.items" :key="item.key">
        <template v-if="item.type === 'group'">
          <DropdownItemGroup v-bind="item" :level="1" />
        </template>
        <template v-else-if="'children' in item">
          <DropdownSubMenu v-bind="item" />
        </template>
        <template v-else-if="item.type === 'divider'">
          <DropdownMenuSeparator />
        </template>
        <DropdownMenuItem v-else v-bind="item" />
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
