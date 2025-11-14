<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { omit } from 'es-toolkit/compat';
import { computed } from 'vue';
import { useFullPath, usePathRegisterContextInject } from '../context/PathContext';
import type { MenuItemGroupType } from '../interface';
import { parseChildren } from '../utils/commonUtil';
import InternalMenuItemGroup from './InternalMenuItemGroup.vue';

export interface MenuItemGroupProps extends Omit<MenuItemGroupType, 'type' | 'children' | 'label'> {
  title?: VueNode;

  children?: VueNode;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

const { eventKey } = defineProps<MenuItemGroupProps>();
const connectedKeyPath = useFullPath(computed(() => eventKey));

const measure = usePathRegisterContextInject();
</script>
<template>
  <template v-if="measure">
    <Render :content="parseChildren($slots?.default?.(), connectedKeyPath)" />
  </template>
  <template v-else>
    <InternalMenuItemGroup v-bind="omit($props, ['warnKey'])">
      <Render :content="parseChildren($slots?.default?.(), connectedKeyPath)" />
    </InternalMenuItemGroup>
  </template>
</template>
