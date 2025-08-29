<script lang="tsx" setup>
import { computed, onBeforeUnmount, ref, watch, type HTMLAttributes } from 'vue';
import { useFullPath, usePathRegisterContextInject } from './context/PathContext';
import type { MenuItemType } from './interface';
import InternalMenuItem from './InternalMenuItem.vue';

export interface MenuItemProps
  extends Omit<MenuItemType, 'label' | 'key'>,
    /** @vue-ignore */ Omit<HTMLAttributes, 'onClick' | 'onMouseenter' | 'onMouseleave' | 'onSelect' | 'style' | 'class'> {
  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { eventKey } = defineProps<MenuItemProps>();

// ==================== Record KeyPath ====================
const measure = usePathRegisterContextInject();
const connectedKeyPath = useFullPath(computed(() => eventKey));

watch(
  connectedKeyPath,
  () => {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath.value);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  measure?.unregisterPath(eventKey, connectedKeyPath.value);
});

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <template v-if="measure"></template>
  <InternalMenuItem v-bind="{ ...$props, ...$attrs }" :ref="(el:any) => (domRef = el?.el)">
    <slot></slot>
  </InternalMenuItem>
</template>
