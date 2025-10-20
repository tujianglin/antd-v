<script lang="tsx" setup>
import { useLocale } from '../locale';
import NormalCancelBtn from './components/NormalCancelBtn.vue';
import NormalOkBtn from './components/NormalOkBtn.vue';
import type { ModalContextProps } from './context';
import { ModalContextProvider } from './context';
import type { FooterRender, ModalProps } from './interface';
import { getConfirmLocale } from './locale';
import { computed } from 'vue';
import { DisabledContextProvider } from '../config-provider/DisabledContext';
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';

interface FooterProps {
  onOk?: (e) => void;
  onCancel?: (e) => void;
}

type Props = FooterProps &
  Pick<ModalProps, 'footer' | 'okText' | 'okType' | 'cancelText' | 'confirmLoading' | 'okButtonProps' | 'cancelButtonProps'>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  okText,
  okType = 'primary',
  cancelText,
  confirmLoading,
  onOk,
  onCancel,
  okButtonProps,
  cancelButtonProps,
  footer,
} = defineProps<Props>();

const [locale] = useLocale('Modal', getConfirmLocale());

// ================== Locale Text ==================
const okTextLocale = computed(() => okText || locale?.value?.okText);
const cancelTextLocale = computed(() => cancelText || locale?.value?.cancelText);

// ================= Context Value =================
const btnCtxValue = computed<ModalContextProps>(() => ({
  confirmLoading,
  okButtonProps,
  cancelButtonProps,
  okTextLocale: okTextLocale.value,
  cancelTextLocale: cancelTextLocale.value,
  okType,
  onOk,
  onCancel,
}));

const btnCtxValueMemo = computed(() => btnCtxValue.value);
const FooterNode = () => {
  let footerNode: VueNode;
  if (typeof footer === 'function' || typeof footer === 'undefined') {
    footerNode = (
      <>
        <NormalCancelBtn />
        <NormalOkBtn />
      </>
    );

    if (typeof footer === 'function') {
      footerNode = (footer as FooterRender)({
        originNode: footerNode,
        extra: {
          OkBtn: NormalOkBtn,
          CancelBtn: NormalCancelBtn,
        },
      });
    }

    footerNode = <ModalContextProvider value={btnCtxValueMemo.value}>{footerNode}</ModalContextProvider>;
  } else {
    footerNode = <Render content={footer}></Render>;
  }
  return footerNode;
};
</script>
<template>
  <DisabledContextProvider :disabled="false">
    <FooterNode />
  </DisabledContextProvider>
</template>
