<script lang="tsx" setup>
import { DropdownMenuItem, DropdownMenuShortcut } from '@/ui/dropdown-menu';
import { reactiveOmit } from '@vueuse/core';
import { useForwardPropsEmits, type DropdownMenuItemEmits } from 'reka-ui';
import Render from '../render';
import type { DropdownMenuItemProps } from './interface';

const props = withDefaults(defineProps<Omit<DropdownMenuItemProps, 'key'>>(), { type: 'item' });

const emits = defineEmits<DropdownMenuItemEmits>();

const delegatedProps = reactiveOmit(props, 'type', 'label', 'extra', 'icon');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
<template>
  <DropdownMenuItem v-bind="forwarded">
    <Render :content="icon" />
    <Render :content="label" />
    <DropdownMenuShortcut><Render :content="extra" /></DropdownMenuShortcut>
  </DropdownMenuItem>
</template>
