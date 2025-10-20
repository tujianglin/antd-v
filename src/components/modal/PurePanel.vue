<script lang="tsx" setup>
import { Panel } from '@/vc-component/dialog';
import type { PanelProps } from '@/vc-component/dialog/Dialog/Content/Panel.vue';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { ModalFuncProps } from './interface';
import Footer from './shared.vue';
import useStyle from './style';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import clsx from 'clsx';
import { renderCloseIcon } from './util';
import ConfirmContent from './ConfirmContent.vue';

export interface PurePanelProps extends Omit<PanelProps, 'prefixCls' | 'footer'>, Pick<ModalFuncProps, 'type' | 'footer'> {
  prefixCls?: string;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  closeIcon,
  closable,
  type,
  title,
  footer,
  ...restProps
} = defineProps<PurePanelProps>();
const { getPrefixCls } = toRefs(useConfigContextInject());

const rootPrefixCls = computed(() => getPrefixCls.value());
const prefixCls = computed(() => customizePrefixCls || getPrefixCls.value('modal'));
const rootCls = useCSSVarCls(rootPrefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const confirmPrefixCls = computed(() => `${prefixCls.value}-confirm`);

const vm = getCurrentInstance();

// Choose target props by confirm mark
const additionalProps = computed(() => {
  let result;
  if (type) {
    result = {
      closable: closable ?? false,
      title: '',
      footer: '',
    };
  } else {
    result = {
      closable: closable ?? true,
      title,
      footer: footer !== null && <Footer {...vm.props} />,
    };
  }
  return result;
});
</script>
<template>
  <ConfigProvider :theme="{ token: { motion: false, zIndexPopupBase: 0 } }">
    <Panel
      v-bind="{ ...restProps, ...additionalProps }"
      :prefix-cls="prefixCls"
      :class="
        clsx(
          hashId,
          `${prefixCls}-pure-panel`,
          type && confirmPrefixCls,
          type && `${confirmPrefixCls}-${type}`,
          className,
          cssVarCls,
          rootCls,
        )
      "
      :close-icon="renderCloseIcon(prefixCls, closeIcon)"
      :closable="closable"
    >
      <ConfirmContent
        v-if="type"
        v-bind="$props"
        :prefix-cls="prefixCls"
        :confirm-prefix-cls="confirmPrefixCls"
        :root-prefix-cls="rootPrefixCls"
        :content="$slots?.default?.()"
      />
      <slot v-else></slot>
    </Panel>
  </ConfigProvider>
</template>
