<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import type { PortalProps } from '@/vc-component/portal/index.vue';
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue';
import { RefContextProvider } from './context';
import type { DrawerPanelEvents } from './DrawerPanel.vue';
import type { DrawerPopupProps } from './DrawerPopup.vue';
import DrawerPopup from './DrawerPopup.vue';
import type { DrawerClassNames, DrawerStyles } from './inter';

export type Placement = 'left' | 'top' | 'right' | 'bottom';

export interface DrawerProps extends Omit<DrawerPopupProps, 'prefixCls' | 'inline' | 'scrollLocker'>, DrawerPanelEvents {
  prefixCls?: string;
  open?: boolean;
  onClose?: (e: MouseEvent | KeyboardEvent) => void;
  destroyOnHidden?: boolean;
  getContainer?: PortalProps['getContainer'];
  panelRef?: HTMLDivElement;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  open = false,
  prefixCls = 'rc-drawer',
  placement = 'right' as Placement,
  autofocus = true,
  keyboard = true,
  width = 378,
  mask = true,
  maskClosable = true,
  getContainer,
  forceRender,
  afterOpenChange,
  destroyOnHidden,
  onMouseenter,
  onMouseover,
  onMouseleave,
  onClick,
  onKeydown,
  onKeyup,

  // Refs
  panelRef,
} = defineProps<DrawerProps>();

const animatedVisible = ref(false);

// ============================= Open =============================
const mounted = ref(false);

onMounted(async () => {
  await nextTick();
  mounted.value = true;
});

const mergedOpen = computed(() => (mounted.value ? open : false));

// ============================ Focus =============================
const popupRef = ref<HTMLDivElement>(null);

const lastActiveRef = ref<HTMLElement>(null);
watch(
  mergedOpen,
  async () => {
    await nextTick();
    if (mergedOpen.value) {
      lastActiveRef.value = document.activeElement as HTMLElement;
    }
  },
  { immediate: true, flush: 'post' },
);

// ============================= Open =============================
const internalAfterOpenChange: DrawerProps['afterOpenChange'] = (nextVisible) => {
  animatedVisible.value = nextVisible;
  afterOpenChange?.(nextVisible);

  if (!nextVisible && lastActiveRef.value && !popupRef.value?.contains(lastActiveRef.value)) {
    lastActiveRef.value?.focus({ preventScroll: true });
  }
};

// =========================== Context ============================
const refContext = computed(() => ({ panel: panelRef }));

const eventHandlers = computed(() => ({
  onMouseenter,
  onMouseover,
  onMouseleave,
  onClick,
  onKeydown,
  onKeyup,
}));

const vm = getCurrentInstance();
const drawerPopupProps = computed(
  (): DrawerPopupProps => ({
    ...vm.props,
    open: mergedOpen.value,
    prefixCls,
    placement,
    autofocus,
    keyboard,
    width,
    mask,
    maskClosable,
    inline: getContainer === false,
    afterOpenChange: internalAfterOpenChange,
    ...eventHandlers.value,
  }),
);
</script>
<template>
  <template v-if="!forceRender && !animatedVisible && !mergedOpen && destroyOnHidden"></template>
  <RefContextProvider v-else :value="refContext">
    <Portal
      :open="mergedOpen || forceRender || animatedVisible"
      :auto-destroy="false"
      :get-container="getContainer"
      :auto-lock="mask && (mergedOpen || animatedVisible)"
    >
      <DrawerPopup v-bind="drawerPopupProps">
        <slot></slot>
      </DrawerPopup>
    </Portal>
  </RefContextProvider>
</template>
