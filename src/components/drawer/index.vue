<script lang="tsx" setup>
import type { DrawerProps as RcDrawerProps } from '@/vc-component/drawer';
import RcDrawer from '@/vc-component/drawer';
import type { CSSMotionProps } from '@/vc-component/motion';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import ContextIsolator from '../_util/ContextIsolator';
import type { MaskType } from '../_util/hooks/useMergedMask';
import useMergedMask from '../_util/hooks/useMergedMask';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useZIndex } from '../_util/hooks/useZIndex';
import { getTransitionName } from '../_util/motion';
import { ZIndexContextProvider } from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import { usePanelRef } from '../watermark/context';
import type { DrawerClassNames, DrawerPanelProps, DrawerStyles } from './DrawerPanel.vue';
import DrawerPanel from './DrawerPanel.vue';
import useStyle from './style';
import { DEFAULT_SIZE, defaultPushState, type sizeType } from './util';

export interface PushState {
  distance: string | number;
}

export interface DrawerResizableConfig {
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

// Drawer diff props: 'open' | 'motion' | 'maskMotion' | 'wrapperClassName'
export interface DrawerProps
  extends Omit<RcDrawerProps, 'maskStyle' | 'destroyOnClose' | 'mask' | 'resizable'>,
    Omit<DrawerPanelProps, 'prefixCls'> {
  size?: sizeType | number;
  resizable?: DrawerResizableConfig;
  open?: boolean;
  afterOpenChange?: (open: boolean) => void;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  mask?: MaskType;
}

defineOptions({ name: 'Drawer', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  size,
  defaultSize = DEFAULT_SIZE,
  mask: drawerMask = true,
  push = defaultPushState,
  open,
  afterOpenChange,
  onClose,
  prefixCls: customizePrefixCls,
  getContainer: customizeGetContainer = undefined,
  style,
  class: className,
  resizable,

  // Deprecated
  destroyOnHidden,
  autofocus = true,
  keyboard = true,
  maskClosable = true,
  ...rest
} = defineProps<DrawerProps>();

const {
  getPopupContainer,
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  mask: contextMask,
} = toRefs(useComponentConfig('drawer'));

const prefixCls = computed(() => getPrefixCls.value('drawer', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const getContainer = computed(() => {
  // 有可能为 false，所以不能直接判断
  return customizeGetContainer === undefined && getPopupContainer?.value
    ? () => getPopupContainer?.value?.(document.body)
    : customizeGetContainer;
});

// ============================ Size ============================
const drawerSize = computed<string | number | undefined>(() => {
  if (size === 'large') {
    return 736;
  }

  if (size === 'default') {
    return DEFAULT_SIZE;
  }
  return size;
});

// =========================== Motion ===========================
const maskMotion = computed<CSSMotionProps>(() => ({
  motionName: getTransitionName(prefixCls.value, 'mask-motion'),
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  motionDeadline: 500,
}));

const panelMotion: RcDrawerProps['motion'] = (motionPlacement) => ({
  motionName: getTransitionName(prefixCls.value, `panel-motion-${motionPlacement}`),
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  motionDeadline: 500,
});

// ============================ Refs ============================
// Select `ant-drawer-content` by `panelRef`
const innerPanelRef = usePanelRef();

const mergedPanelRef = (el) => {
  innerPanelRef(el?.wrapper);
};

// ============================ zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Drawer',
  computed(() => rest.zIndex),
);

// =========================== Render ===========================
const [mergedMask, maskBlurClassName] = useMergedMask(
  computed(() => drawerMask),
  contextMask,
  prefixCls,
);

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, rest.classNames]),
  computed(() => [contextStyles?.value, rest.styles]),
);

const drawerClassName = computed(() =>
  clsx(
    {
      'no-mask': !mergedMask.value,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    rootClassName,
    hashId.value,
    cssVarCls.value,
    mergedClassNames?.value?.root,
  ),
);
</script>
<template>
  <ContextIsolator form space>
    <ZIndexContextProvider :value="contextZIndex">
      <RcDrawer
        :ref="mergedPanelRef"
        v-bind="{ ...rest, ...(resizable ? { resizable } : {}) }"
        :prefix-cls="prefixCls"
        @close="onClose"
        :mask-motion="maskMotion"
        :motion="panelMotion"
        :autofocus="autofocus"
        :keyboard="keyboard"
        :mask-closable="maskClosable"
        :class-names="{
          mask: clsx(mergedClassNames.mask, maskBlurClassName.mask),
          section: mergedClassNames.section,
          wrapper: mergedClassNames.wrapper,
          dragger: mergedClassNames.dragger,
        }"
        :styles="{
          mask: mergedStyles.mask,
          section: mergedStyles.section,
          wrapper: mergedStyles.wrapper,
          dragger: mergedStyles.dragger,
        }"
        :open="open"
        :mask="mergedMask"
        :push="push"
        :size="drawerSize"
        :default-size="defaultSize"
        :style="{ ...contextStyle, ...style }"
        :root-style="{ ...rootStyle, ...mergedStyles.root }"
        :class="clsx(contextClassName, className)"
        :root-class-name="drawerClassName"
        :get-container="getContainer"
        :after-open-change="afterOpenChange"
        :z-index="zIndex"
        :destroy-on-hidden="destroyOnHidden"
      >
        <DrawerPanel :prefix-cls="prefixCls" v-bind="rest" @close="onClose">
          <slot></slot>
        </DrawerPanel>
      </RcDrawer>
    </ZIndexContextProvider>
  </ContextIsolator>
</template>
