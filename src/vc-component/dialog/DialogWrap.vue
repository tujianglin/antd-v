<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { RefContextProvider } from './context';
import Dialog from './Dialog/index.vue';
import type { IDialogPropTypes } from './IDialogPropTypes';

defineOptions({ name: 'Dialog', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  visible,
  getContainer,
  forceRender,
  destroyOnHidden = false,
  afterClose,
  closable,
  keyboard = true,
  focusTriggerAfterClose = true,
  mask = true,
  maskClosable = true,
} = defineProps<IDialogPropTypes>();

const animatedVisible = ref<boolean>(visible);

const dialogRef = useTemplateRef('dialogRef');

const refContext = computed(() => ({ panel: dialogRef.value?.el as unknown as HTMLDivElement }));

watch(
  () => visible,
  () => {
    if (visible) {
      animatedVisible.value = true;
    }
  },
  { immediate: true },
);

defineExpose({
  get panel() {
    return dialogRef.value?.el;
  },
});
</script>
<template>
  <RefContextProvider v-if="forceRender || !destroyOnHidden || animatedVisible" :value="refContext">
    <Portal
      :open="visible || forceRender || animatedVisible"
      :auto-destroy="false"
      :get-container="getContainer || undefined"
      :auto-lock="visible || animatedVisible"
    >
      <Dialog
        v-bind="$props"
        ref="dialogRef"
        :keyboard="keyboard"
        :focus-trigger-after-close="focusTriggerAfterClose"
        :mask="mask"
        :mask-closable="maskClosable"
        :destroy-on-hidden="destroyOnHidden"
        :after-close="
          () => {
            const closableObj = closable && typeof closable === 'object' ? closable : {};
            const { afterClose: closableAfterClose } = closableObj || {};
            closableAfterClose?.();
            afterClose?.();
            animatedVisible = false;
          }
        "
      >
        <slot></slot>
      </Dialog>
    </Portal>
  </RefContextProvider>
</template>
