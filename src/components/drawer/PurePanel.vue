<script lang="tsx" setup>
import type { Placement } from '@/vc-component/drawer/Drawer.vue';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { DrawerPanelProps } from './DrawerPanel.vue';
import DrawerPanel from './DrawerPanel.vue';
import useStyle from './style';

interface PurePanelInterface {
  prefixCls?: string;
  style?: CSSProperties;
  class?: string;
  placement?: Placement;
}

type Props = Omit<DrawerPanelProps, 'prefixCls'> & PurePanelInterface;

/** @private Internal Component. Do not use in your production. */

const { prefixCls: customizePrefixCls, style, class: className, placement = 'right', ...restProps } = defineProps<Props>();
const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('drawer', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);
</script>
<template>
  <div :class="clsx(prefixCls, `${prefixCls}-pure`, `${prefixCls}-${placement}`, hashId, cssVarCls, className)" :style="style">
    <DrawerPanel :prefix-cls="prefixCls" v-bind="restProps" />
  </div>
</template>
