<script lang="tsx" setup>
import clsx from 'clsx';
import { toRefs } from 'vue';
import { useMenuContextInject } from './context/MenuContext';
import { usePathRegisterContextInject } from './context/PathContext';
import type { MenuDividerType } from './interface';

export type DividerProps = Omit<MenuDividerType, 'type'>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, style } = defineProps<DividerProps>();

const { prefixCls } = toRefs(useMenuContextInject());

const measure = usePathRegisterContextInject();
</script>
<template>
  <template v-if="measure"></template>
  <li v-else role="separator" :class="clsx(`${prefixCls}-item-divider`, className)" :style="style"></li>
</template>
