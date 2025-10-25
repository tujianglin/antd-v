<script lang="tsx" setup>
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons-vue';
import { computed, ref, watch } from 'vue';
import clsx from 'clsx';

export type ShowCollapsibleIconMode = boolean | 'auto';

export interface SplitBarProps {
  index: number;
  active: boolean;
  prefixCls: string;
  resizable: boolean;
  startCollapsible: boolean;
  endCollapsible: boolean;
  showStartCollapsibleIcon: ShowCollapsibleIconMode;
  showEndCollapsibleIcon: ShowCollapsibleIconMode;
  onOffsetStart: (index: number) => void;
  onOffsetUpdate: (index: number, offsetX: number, offsetY: number, lazyEnd?: boolean) => void;
  onOffsetEnd: (lazyEnd?: boolean) => void;
  onCollapse: (index: number, type: 'start' | 'end') => void;
  vertical: boolean;
  ariaNow: number;
  ariaMin: number;
  ariaMax: number;
  lazy?: boolean;
  containerSize: number;
}

defineOptions({ name: 'SplitBar', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  vertical,
  index,
  active,
  ariaNow,
  ariaMin,
  ariaMax,
  resizable,
  startCollapsible,
  endCollapsible,
  onOffsetStart,
  onOffsetUpdate,
  onOffsetEnd,
  onCollapse,
  lazy,
  containerSize,
  showStartCollapsibleIcon,
  showEndCollapsibleIcon,
} = defineProps<Partial<SplitBarProps>>();

function getValidNumber(num?: number): number {
  return typeof num === 'number' && !Number.isNaN(num) && Number.isFinite(num) ? Math.round(num) : 0;
}

const splitBarPrefixCls = computed(() => `${prefixCls}-bar`);

// ======================== Resize ========================
const startPos = ref<[x: number, y: number] | null>(null);
const constrainedOffset = ref(0);

const constrainedOffsetX = computed(() => (vertical ? 0 : constrainedOffset.value));
const constrainedOffsetY = computed(() => (vertical ? constrainedOffset.value : 0));

const onMousedown = (e: MouseEvent) => {
  if (resizable && e.currentTarget) {
    startPos.value = [e.pageX, e.pageY];
    onOffsetStart(index);
  }
};

const onTouchstart = (e: TouchEvent) => {
  if (resizable && e.touches.length === 1) {
    const touch = e.touches[0];
    startPos.value = [touch.pageX, touch.pageY];
    onOffsetStart(index);
  }
};

// Updated constraint calculation
const getConstrainedOffset = (rawOffset: number) => {
  const currentPos = (containerSize * ariaNow) / 100;
  const newPos = currentPos + rawOffset;

  // Calculate available space
  const minAllowed = Math.max(0, (containerSize * ariaMin) / 100);
  const maxAllowed = Math.min(containerSize, (containerSize * ariaMax) / 100);

  // Constrain new position within bounds
  const clampedPos = Math.max(minAllowed, Math.min(maxAllowed, newPos));
  return clampedPos - currentPos;
};

const handleLazyMove = (offsetX: number, offsetY: number) => {
  const constrainedOffsetValue = getConstrainedOffset(vertical ? offsetY : offsetX);
  constrainedOffset.value = constrainedOffsetValue;
};

const handleLazyEnd = () => {
  onOffsetUpdate(index, constrainedOffsetX.value, constrainedOffsetY.value, true);
  constrainedOffset.value = 0;
  onOffsetEnd(true);
};

const getVisibilityClass = (mode: ShowCollapsibleIconMode): string => {
  switch (mode) {
    case true:
      return `${splitBarPrefixCls.value}-collapse-bar-always-visible`;
    case false:
      return `${splitBarPrefixCls.value}-collapse-bar-always-hidden`;
    case 'auto':
      return `${splitBarPrefixCls.value}-collapse-bar-hover-only`;
  }
};

watch(
  [startPos, () => index, () => lazy],
  (_, _1, clearUp) => {
    if (!startPos.value) return;

    const onMouseMove = (e: MouseEvent) => {
      const { pageX, pageY } = e;
      const offsetX = pageX - startPos.value[0];
      const offsetY = pageY - startPos.value[1];
      if (lazy) {
        handleLazyMove(offsetX, offsetY);
      } else {
        onOffsetUpdate(index, offsetX, offsetY);
      }
    };

    const onMouseUp = () => {
      if (lazy) {
        handleLazyEnd();
      } else {
        onOffsetEnd();
      }
      startPos.value = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const offsetX = touch.pageX - startPos.value[0];
        const offsetY = touch.pageY - startPos.value[1];
        if (lazy) {
          handleLazyMove(offsetX, offsetY);
        } else {
          onOffsetUpdate(index, offsetX, offsetY);
        }
      }
    };

    const handleTouchEnd = () => {
      if (lazy) {
        handleLazyEnd();
      } else {
        onOffsetEnd();
      }
      startPos.value = null;
    };

    const eventHandlerMap: Partial<Record<keyof WindowEventMap, EventListener>> = {
      mousemove: onMouseMove as EventListener,
      mouseup: onMouseUp,
      touchmove: handleTouchMove as EventListener,
      touchend: handleTouchEnd,
    };

    for (const [event, handler] of Object.entries(eventHandlerMap)) {
      window.addEventListener(event, handler, { passive: false });
    }

    clearUp(() => {
      for (const [event, handler] of Object.entries(eventHandlerMap)) {
        window.removeEventListener(event, handler);
      }
    });
  },
  { deep: true },
);

const transformStyle = computed(() => ({
  [`--${splitBarPrefixCls.value}-preview-offset`]: `${constrainedOffset.value}px`,
}));

// ======================== Render ========================
const StartIcon = (props) => (vertical ? <UpOutlined {...props}></UpOutlined> : <LeftOutlined {...props}></LeftOutlined>);
const EndIcon = (props) => (vertical ? <DownOutlined {...props}></DownOutlined> : <RightOutlined {...props}></RightOutlined>);
</script>
<template>
  <div
    :class="clsx(splitBarPrefixCls)"
    :aria-valuenow="getValidNumber(ariaNow)"
    :aria-valuemin="getValidNumber(ariaMin)"
    :aria-valuemax="getValidNumber(ariaMax)"
  >
    <div
      v-if="lazy"
      :class="
        clsx(
          clsx(`${splitBarPrefixCls}-preview`, {
            [`${splitBarPrefixCls}-preview-active`]: !!constrainedOffset,
          }),
        )
      "
      :style="transformStyle"
    ></div>
    <div
      :class="
        clsx(`${splitBarPrefixCls}-dragger`, {
          [`${splitBarPrefixCls}-dragger-disabled`]: !resizable,
          [`${splitBarPrefixCls}-dragger-active`]: active,
        })
      "
      @mousedown="onMousedown"
      @touchstart.passive="onTouchstart"
    ></div>
    <div
      v-if="startCollapsible"
      :class="
        clsx(
          `${splitBarPrefixCls}-collapse-bar`,
          `${splitBarPrefixCls}-collapse-bar-start`,
          getVisibilityClass(showStartCollapsibleIcon),
        )
      "
      @click="() => onCollapse(index, 'start')"
    >
      <StartIcon :class="clsx(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-start`)" />
    </div>
    <div
      v-if="endCollapsible"
      :class="
        clsx(
          `${splitBarPrefixCls}-collapse-bar`,
          `${splitBarPrefixCls}-collapse-bar-end`,
          getVisibilityClass(showEndCollapsibleIcon),
        )
      "
      @click="() => onCollapse(index, 'end')"
    >
      <EndIcon :class="clsx(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-end`)" />
    </div>
  </div>
</template>
