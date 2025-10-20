<script lang="tsx" setup>
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import useClosable from '../_util/hooks/useClosable';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import PopoverRawPurePanel from '../popover/RawPurePanel.vue';
import type { TourStepProps } from './interface';
import TourPanel from './panelRender.vue';
import useStyle from './style';

export interface PurePanelProps extends TourStepProps {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  current = 0,
  total = 6,
  class: className,
  style,
  type,
  closable,
  closeIcon,
  ...restProps
} = defineProps<PurePanelProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('tour', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const [mergedClosable, mergedCloseIcon] = useClosable(
  computed(() => ({ closable: closable as boolean, closeIcon })),
  null,
  computed(() => ({
    closable: true,
    closeIconRender: (icon: any) =>
      isValidElement(icon)
        ? cloneElement(icon, {
            class: clsx(icon.props?.className, `${prefixCls.value}-close-icon`),
          })
        : icon,
  })),
);
</script>
<template>
  <ConfigProvider :theme="{ token: { motion: false, zIndexPopupBase: 0 } }">
    <PopoverRawPurePanel
      :prefix-cls="prefixCls"
      :hash-id="hashId"
      :class="clsx(className, `${prefixCls}-pure`, type && `${prefixCls}-${type}`, cssVarCls)"
      :style="style"
    >
      <TourPanel
        :step-props="{
          ...restProps,
          prefixCls,
          total,
          closable: mergedClosable ? { closeIcon: mergedCloseIcon } : undefined,
        }"
        :current="current"
        :type="type"
      />
    </PopoverRawPurePanel>
  </ConfigProvider>
</template>
