<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import type { PortalProps } from '@/vc-component/portal/index.vue';
import { computed, getCurrentInstance, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
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
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
  /** Size of the drawer (width for left/right placement, height for top/bottom placement) */
  size?: number | string;
  /** Maximum size of the drawer */
  maxSize?: number;
  /** Default size for uncontrolled resizable drawer */
  defaultSize?: number | string;
  /** Resizable configuration - boolean to enable/disable or object with optional callbacks */
  resizable?:
    | boolean
    | {
        onResize?: (size: number) => void;
        onResizeStart?: () => void;
        onResizeEnd?: () => void;
      };
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
  getContainer = undefined,
  forceRender,
  afterOpenChange,
  destroyOnHidden,
  onMouseenter,
  onMouseover,
  onMouseleave,
  onClick,
  onKeydown,
  onKeyup,
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
const drawerPopupRef = useTemplateRef('drawerPopupRef');

// =========================== Context ============================
const refContext = computed(() => ({ panel: drawerPopupRef.value?.el }));

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

defineExpose({
  get wrapper() {
    return drawerPopupRef.value?.wrapper;
  },
  get el() {
    return drawerPopupRef.value?.el;
  },
});
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
      <DrawerPopup ref="drawerPopupRef" v-bind="drawerPopupProps">
        <component :is="$slots.default" />
      </DrawerPopup>
    </Portal>
  </RefContextProvider>
</template>
