<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import Render from '@/vc-component/render';
import Trigger from '@/vc-component/trigger';
import raf from '@/vc-util/raf';
import clsx from 'clsx';
import { computed, onBeforeUnmount, ref, toRefs, watch, type CSSProperties } from 'vue';
import { useMenuContextInject } from '../context/MenuContext';
import type { MenuMode } from '../interface';
import placements, { placementsRtl } from '../placements';
import { getMotion } from '../utils/motionUtil';

export interface PopupTriggerProps {
  prefixCls: string;
  mode: MenuMode;
  visible: boolean | undefined;
  popup: any;
  popupStyle?: CSSProperties;
  popupClassName?: string;
  popupOffset?: number[];
  disabled: boolean;
  onVisibleChange: (visible: boolean) => void;
}

const { prefixCls, visible, popup, popupStyle, popupClassName, popupOffset, disabled, mode, onVisibleChange } =
  defineProps<PopupTriggerProps>();

const {
  getPopupContainer,
  rtl,
  subMenuOpenDelay,
  subMenuCloseDelay,
  builtinPlacements,
  triggerSubMenuAction,
  forceSubMenuRender,
  rootClassName,

  // Motion
  motion,
  defaultMotions,
} = toRefs(useMenuContextInject());

const innerVisible = ref(false);

const placement = computed(() =>
  rtl.value ? { ...placementsRtl, ...builtinPlacements?.value } : { ...placements, ...builtinPlacements?.value },
);

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
};
const popupPlacement = computed(() => popupPlacementMap[mode]);

const targetMotion = computed(() => getMotion(mode, motion?.value, defaultMotions?.value));
const targetMotionRef = computed(() => {
  let result = targetMotion.value;

  if (mode !== 'inline') {
    result = targetMotion.value;
  }
  return result;
});

const mergedMotion = computed<CSSMotionProps>(() => ({
  ...targetMotionRef.value,
  leavedClassName: `${prefixCls}-hidden`,
  removeOnLeave: false,
  motionAppear: true,
}));

// Delay to change visible
const visibleRef = ref<number>();
watch(
  () => visible,
  () => {
    visibleRef.value = raf(() => {
      innerVisible.value = visible;
    });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  raf.cancel(visibleRef.value);
});
</script>
<template>
  <Trigger
    :prefix-cls="prefixCls"
    :popup-class-name="
      clsx(
        `${prefixCls}-popup`,
        {
          [`${prefixCls}-rtl`]: rtl,
        },
        popupClassName,
        rootClassName,
      )
    "
    :stretch="mode === 'horizontal' ? 'minWidth' : null"
    :get-popup-container="getPopupContainer"
    :builtin-placements="placement"
    :popup-placement="popupPlacement"
    :popup-visible="innerVisible"
    :popup="popup"
    :popup-style="popupStyle"
    :popup-align="popupOffset && { offset: popupOffset }"
    :action="disabled ? [] : [triggerSubMenuAction]"
    :mouse-enter-delay="subMenuOpenDelay"
    :mouse-leave-delay="subMenuCloseDelay"
    @open-change="onVisibleChange"
    :force-render="forceSubMenuRender"
    :popup-motion="mergedMotion"
    fresh
  >
    <template #popup>
      <Render :content="popup" />
    </template>
    <slot></slot>
  </Trigger>
</template>
