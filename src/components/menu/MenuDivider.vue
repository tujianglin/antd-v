<script lang="tsx" setup>
import { Divider } from '@/vc-component/menu';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type HTMLAttributes } from 'vue';
import { useConfigContextInject } from '../config-provider';

export interface MenuDividerProps extends /** @vue-ignore */ HTMLAttributes {
  class?: string;
  prefixCls?: string;
  style?: CSSProperties;
  dashed?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, class: className, dashed, ...restProps } = defineProps<MenuDividerProps>();
const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('menu', customizePrefixCls));
const classString = computed(() =>
  clsx(
    {
      [`${prefixCls.value}-item-divider-dashed`]: !!dashed,
    },
    className,
  ),
);
</script>
<template>
  <Divider :class="classString" v-bind="{ ...restProps, ...$attrs }" />
</template>
