<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import { falseToUndefined } from '@/vc-util/props';
import { computed, ref, watch } from 'vue';
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
  panelRef,
} = defineProps<IDialogPropTypes>();

const animatedVisible = ref<boolean>(visible);

const refContext = computed(() => ({ panel: panelRef }));

watch(
  () => visible,
  () => {
    if (visible) {
      animatedVisible.value = true;
    }
  },
  { immediate: true },
);
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
        v-bind="falseToUndefined($props)"
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
<style lang="less">
@import './assets/bootstrap.less';
@import './assets/index.less';
</style>
