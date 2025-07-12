<script lang="tsx" setup>
import { DropdownMenuSeparator } from '@/ui/dropdown-menu';
import DropdownMenuLabel from '@/ui/dropdown-menu/DropdownMenuLabel.vue';
import { omit } from 'lodash-es';
import Render from '../render';
import DropdownMenuItem from './DropdownMenuItem.vue';
import DropdownSubMenu from './DropdownSubMenu.vue';
import type { DropdownItemGroupProps } from './interface';

defineOptions({ name: 'DropdownItemGroup' });

defineProps<Omit<DropdownItemGroupProps, 'key'> & { level: number }>();
</script>
<template>
  <DropdownMenuLabel class="opacity-50" :style="{ marginRight: ` ${8 * level}px`, marginLeft: ` ${8 * level}px` }">
    <Render :content="label" />
  </DropdownMenuLabel>
  <template v-for="item in children" :key="item.key">
    <template v-if="item.type === 'group'">
      <DropdownItemGroup v-bind="item" :level="level + 1" />
    </template>
    <template v-else-if="'children' in item">
      <DropdownSubMenu v-bind="item" :style="{ marginRight: ` ${8 * (level + 1)}px`, marginLeft: ` ${8 * (level + 1)}px` }" />
    </template>
    <template v-else-if="item.type === 'divider'">
      <DropdownMenuSeparator />
    </template>
    <DropdownMenuItem
      v-else
      v-bind="omit(item, 'type')"
      :style="{ marginRight: ` ${8 * (level + 1)}px`, marginLeft: ` ${8 * (level + 1)}px` }"
    />
  </template>
</template>
