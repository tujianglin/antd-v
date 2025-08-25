<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import type { CSSMotionRef } from '@/vc-component/motion/CSSMotion.vue';
import { falseToUndefined } from '@/vc-util/props';
import { composeRef } from '@/vc-util/ref';
import clsx from 'clsx';
import { computed, ref, type CSSProperties } from 'vue';
import { offset } from '../../util';
import type { PanelProps, PanelRef } from './Panel.vue';
import Panel from './Panel.vue';
export type CSSMotionStateRef = Pick<CSSMotionRef, 'inMotion' | 'enableMotion'>;

export type ContentRef = PanelRef & CSSMotionStateRef;

export type ContentProps = {
  motionName: string;
  ariaId?: string;
  onVisibleChanged: (visible: boolean) => void;
} & PanelProps;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  title,
  style,
  class: className,
  visible,
  forceRender,
  destroyOnHidden,
  motionName,
  ariaId,
  onVisibleChanged,
  mousePosition,
} = defineProps<ContentProps>();

const dialogRef = ref<{ nativeElement: HTMLElement } & CSSMotionStateRef>(null);

const panelRef = ref<PanelRef>(null);

// ============================== Refs ==============================
defineExpose({
  focus: () => {
    panelRef.value?.focus();
  },
  changeActive: (e) => {
    panelRef.value?.changeActive(e);
  },
  inMotion: () => {
    return dialogRef.value?.inMotion();
  },
  enableMotion: () => {
    return dialogRef.value?.enableMotion();
  },
});

// ============================= Style ==============================
const transformOrigin = ref<string>();
const contentStyle = computed(() => {
  const result = {} as CSSProperties;
  if (transformOrigin.value) {
    result.transformOrigin = transformOrigin.value;
  }
  return result;
});

function onPrepare() {
  const elementOffset = offset(dialogRef.value.nativeElement);
  transformOrigin.value =
    mousePosition && (mousePosition.x || mousePosition.y)
      ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px`
      : '';
}
</script>
<template>
  <CSSMotion
    :visible="visible"
    @visible-changed="onVisibleChanged"
    @appear-prepare="onPrepare"
    @enter-prepare="onPrepare"
    :force-render="forceRender"
    :motion-name="motionName"
    :remove-on-leave="destroyOnHidden"
    ref="dialogRef"
  >
    <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
      <Panel
        v-bind="falseToUndefined($props)"
        :ref="composeRef((el) => (panelRef = el), motionRef)"
        :title="title"
        :aria-id="ariaId"
        :prefix-cls="prefixCls"
        :style="{ ...motionStyle, ...style, ...contentStyle }"
        :class="clsx(className, motionClassName)"
      >
        <slot></slot>
      </Panel>
    </template>
  </CSSMotion>
</template>
