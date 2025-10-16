<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, h, toRefs, type CSSProperties } from 'vue';
import { useConfigContextInject } from '../config-provider';
import PopoverPurePanel from '../popover/PurePanel.vue';
import type { PopconfirmProps } from './index.vue';
import type { OverlayProps } from './Overlay.vue';
import Overlay from './Overlay.vue';
import useStyle from './style';

export interface PurePanelProps extends Omit<OverlayProps, 'prefixCls'>, Pick<PopconfirmProps, 'placement'> {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, placement, class: className, style, ...restProps } = defineProps<PurePanelProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('popconfirm', customizePrefixCls));
useStyle(prefixCls);
</script>
<template>
  <PopoverPurePanel
    :placement="placement"
    :class="clsx(prefixCls, className)"
    :style="style"
    :content="() => h(Overlay, { prefixCls, ...restProps })"
  />
</template>
