<script lang="tsx" setup>
import {
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/ui/dropdown-menu';
import { reactiveOmit } from '@vueuse/core';
import { useForwardPropsEmits, type DropdownMenuSubEmits, type DropdownMenuSubProps } from 'reka-ui';
import Render from '../render';
import DropdownItemGroup from './DropdownItemGroup.vue';
import DropdownMenuItem from './DropdownMenuItem.vue';
import type { DropdownSubMenuProps } from './interface';

defineOptions({ name: 'DropdownSubMenu' });

const props = defineProps<Omit<DropdownSubMenuProps, 'key'> & DropdownMenuSubProps>();

const emits = defineEmits<DropdownMenuSubEmits>();

const delegatedProps = reactiveOmit(props, 'type', 'label', 'icon', 'children', 'style');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
<template>
  <DropdownMenuSub v-bind="forwarded">
    <DropdownMenuSubTrigger :disabled="disabled" class="data-[disabled]:opacity-50" :style="style">
      <Render :content="icon" />
      <Render :content="label" />
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        <template v-for="item in children" :key="item.key">
          <template v-if="item.type === 'group'">
            <DropdownItemGroup v-bind="item" :level="0" />
          </template>
          <template v-else-if="'children' in item">
            <DropdownSubMenu v-bind="item" />
          </template>
          <template v-else-if="item.type === 'divider'">
            <DropdownMenuSeparator />
          </template>
          <DropdownMenuItem v-else v-bind="item" />
        </template>
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
</template>
