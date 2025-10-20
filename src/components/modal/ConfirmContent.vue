<script lang="tsx" setup>
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons-vue';
import type { ConfirmDialogProps } from './ConfirmDialog.vue';
import Render from '@/vc-component/render';
import { computed, toRefs } from 'vue';
import { useLocale } from '../locale';
import { reactiveComputed } from '@vueuse/core';
import { ModalContextProvider, type ModalContextProps } from './context';
import CancelBtn from './components/ConfirmCancelBtn.vue';
import OkBtn from './components/ConfirmOkBtn.vue';
import { isVueNode } from '@/vc-util/Children/util';
import clsx from 'clsx';
import Confirm from './style/confirm';
import type { FooterRender } from './interface';

type Props = ConfirmDialogProps & {
  confirmPrefixCls: string;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  icon,
  okText,
  cancelText,
  confirmPrefixCls,
  type,
  okCancel,
  footer,
  // Legacy for static function usage
  locale: staticLocale,
  ...restProps
} = defineProps<Props>();

// Icon
const MergedIcon = () => {
  let mergedIcon = <Render content={icon}></Render>;

  // 支持传入{ icon: null }来隐藏`Modal.confirm`默认的Icon
  if (!icon && icon !== null) {
    switch (type) {
      case 'info':
        mergedIcon = <InfoCircleFilled />;
        break;

      case 'success':
        mergedIcon = <CheckCircleFilled />;
        break;

      case 'error':
        mergedIcon = <CloseCircleFilled />;
        break;

      default:
        mergedIcon = <ExclamationCircleFilled />;
    }
  }
  return mergedIcon;
};

// 默认为 true，保持向下兼容
const mergedOkCancel = computed(() => okCancel ?? type === 'confirm');

const autoFocusButton = computed(() => (restProps.autoFocusButton === null ? false : restProps.autoFocusButton || 'ok'));

const [locale] = useLocale('Modal');

const mergedLocale = computed(() => staticLocale || locale?.value);

// ================== Locale Text ==================
const okTextLocale = computed(
  () => okText || (mergedOkCancel.value ? mergedLocale.value?.okText : mergedLocale.value?.justOkText),
);
const cancelTextLocale = computed(() => cancelText || mergedLocale?.value?.cancelText);

// ================= Context Value =================
const { closable } = toRefs(reactiveComputed(() => restProps));
const { onClose } = toRefs(
  reactiveComputed(() => (closable.value && typeof closable.value === 'object' ? (closable.value as any) : {})),
);
const btnCtxValue = computed<ModalContextProps>(() => ({
  autoFocusButton: autoFocusButton.value,
  cancelTextLocale: cancelTextLocale.value,
  okTextLocale: okTextLocale.value,
  mergedOkCancel: mergedLocale.value,
  onClose: onClose?.value,
  ...restProps,
}));
const btnCtxValueMemo = computed(() => btnCtxValue.value);

// ====================== Footer Origin Node ======================
const FooterOriginNode = () => (
  <>
    <CancelBtn />
    <OkBtn />
  </>
);

const hasTitle = computed(() => isVueNode(restProps.title));

const bodyCls = computed(() => `${confirmPrefixCls}-body`);
</script>
<template>
  <div :class="`${confirmPrefixCls}-body-wrapper`">
    <div
      :class="
        clsx(bodyCls, {
          [`${bodyCls}-has-title`]: hasTitle,
        })
      "
    >
      <MergedIcon />
      <div :class="`${confirmPrefixCls}-paragraph`">
        <span v-if="hasTitle" :class="`${confirmPrefixCls}-title`">
          <Render :content="title" />
        </span>
        <div :class="`${confirmPrefixCls}-content`">
          <Render :content="content" />
        </div>
      </div>
    </div>
    <ModalContextProvider v-if="footer === undefined || typeof footer === 'function'" :value="btnCtxValueMemo">
      <div :class="`${confirmPrefixCls}-btns`">
        <Render
          :content="
            typeof footer === 'function'
              ? (footer as FooterRender)?.({originNode: FooterOriginNode, extra: {
                  OkBtn,
                  CancelBtn,
                }})
              : FooterOriginNode
          "
        />
      </div>
    </ModalContextProvider>
    <Render v-else :content="footer" />

    <Confirm :prefix-cls="prefixCls" />
  </div>
</template>
