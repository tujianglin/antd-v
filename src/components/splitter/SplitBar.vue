<script lang="tsx" setup>
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons-vue';
import { computed, ref, watch } from 'vue';
import clsx from 'clsx';

export interface SplitBarProps {
  index: number;
  active: boolean;
  resizable: boolean;
  startCollapsible: boolean;
  endCollapsible: boolean;
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
  size?: number | string;
}

defineOptions({ name: 'SplitBar', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  vertical,
  index,
  active,
  ariaNow = 0,
  ariaMin = 0,
  ariaMax = 0,
  resizable,
  startCollapsible,
  endCollapsible,
  onOffsetStart,
  onOffsetUpdate,
  onOffsetEnd,
  onCollapse,
  lazy,
  containerSize,
  size = 8,
} = defineProps<Partial<SplitBarProps>>();

const startPos = ref<[x: number, y: number] | null>(null);
const constrainedOffset = ref(0);
const constrainedOffsetX = computed(() => (vertical ? 0 : constrainedOffset.value));
const constrainedOffsetY = computed(() => (vertical ? constrainedOffset.value : 0));
const StartIcon = vertical ? <UpOutlined></UpOutlined> : <LeftOutlined></LeftOutlined>;
const EndIcon = vertical ? <DownOutlined></DownOutlined> : <RightOutlined></RightOutlined>;
watch(
  startPos,
  (val) => {
    if (val) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  },
  { deep: true },
);

function handleTouchMove(e: TouchEvent) {
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
}

function handleTouchEnd() {
  if (lazy) {
    handleLazyEnd();
  } else {
    onOffsetEnd();
  }
  startPos.value = null;
}

function onMouseMove(e: MouseEvent) {
  const { pageX, pageY } = e;
  const offsetX = pageX - startPos.value[0];
  const offsetY = pageY - startPos.value[1];
  if (lazy) {
    handleLazyMove(offsetX, offsetY);
  } else {
    onOffsetUpdate(index, offsetX, offsetY);
  }
}

function onMouseUp() {
  if (lazy) {
    handleLazyEnd();
  } else {
    onOffsetEnd();
  }
  startPos.value = null;
}

function handleLazyEnd() {
  onOffsetUpdate(index, constrainedOffsetX.value, constrainedOffsetY.value, true);
  constrainedOffset.value = 0;
  onOffsetEnd(true);
}

// 更新的约束计算
const getConstrainedOffset = (rawOffset: number) => {
  const currentPos = (containerSize * ariaNow) / 100;
  const newPos = currentPos + rawOffset;

  // 计算可用空间
  const minAllowed = Math.max(0, (containerSize * ariaMin) / 100);
  const maxAllowed = Math.min(containerSize, (containerSize * ariaMax) / 100);

  // 在边界内约束新位置
  const clampedPos = Math.max(minAllowed, Math.min(maxAllowed, newPos));
  return clampedPos - currentPos;
};

function handleLazyMove(offsetX: number, offsetY: number) {
  const constrainedOffsetValue = getConstrainedOffset(vertical ? offsetY : offsetX);
  constrainedOffset.value = constrainedOffsetValue;
}
function onMouseDown(e: MouseEvent) {
  if (resizable && e.currentTarget) {
    startPos.value = [e.pageX, e.pageY];
    onOffsetStart(index);
  }
}

function onTouchStart(e: TouchEvent) {
  if (resizable && e.touches.length === 1) {
    const touch = e.touches[0];
    startPos.value = [touch.pageX, touch.pageY];
    onOffsetStart(index);
  }
}

function getValidNumber(num: number | undefined): number {
  return typeof num === 'number' && !Number.isNaN(num) ? Math.round(num) : 0;
}
</script>
<template>
  <div
    :class="clsx('group relative box-border flex-none select-none')"
    :aria-valuenow="getValidNumber(ariaNow)"
    :aria-valuemin="getValidNumber(ariaMin)"
    :aria-valuemax="getValidNumber(ariaMax)"
    :style="vertical ? { height: `${size}px` } : { width: `${size}px` }"
  >
    <div
      v-if="lazy"
      :class="
        clsx('pointer-none bg-sidebar-ring absolute z-1 hidden opacity-20 transition-none', {
          'h-full transform-[translateX(calc(var(--offset)))]': !vertical,
          'w-full transform-[translateY(calc(var(--offset)))]': vertical,
          '!block': active,
        })
      "
      :style="{ '--offset': `${constrainedOffset}px`, ...(vertical ? { height: `${size}px` } : { width: `${size}px` }) }"
    ></div>
    <div
      :class="
        clsx(
          'absolute top-[50%] left-[50%] z-1 box-border transform-[translate(-50%,-50%)] before:absolute before:top-[50%] before:left-[50%] before:transform-[translate(-50%,-50%)] before:content-around before:bg-transparent',
          {
            'h-full cursor-col-resize before:h-full before:w-full': !vertical,
            'w-full cursor-row-resize before:h-full before:w-[calc(100%+2px)]': vertical,
            'cursor-default': !resizable,
            'before:!bg-primary': active,
          },
        )
      "
      :style="vertical ? { height: `${size}px` } : { width: `${size}px` }"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
    ></div>
    <div
      v-if="startCollapsible"
      :class="
        clsx(
          'flex-center hover:bg-sidebar-ring bg-main-bg absolute z-2 box-border cursor-pointer opacity-0 group-hover:opacity-100 hover:text-white',
          {
            'top-[50%] left-auto h-6 w-3 transform-[translateY(-50%)]': !vertical,
            'top-auto left-[50%] h-3 w-6 transform-[translateX(-50%)]': vertical,
          },
        )
      "
      :style="vertical ? { bottom: `${+size + 2}px` } : { right: `${+size + 2}px` }"
      @click="() => onCollapse(index, 'start')"
    >
      <StartIcon />
    </div>
    <div
      v-if="endCollapsible"
      :class="
        clsx(
          'flex-center hover:bg-sidebar-ring bg-main-bg absolute z-2 box-border cursor-pointer opacity-0 group-hover:opacity-100 hover:text-white',
          {
            'top-[50%] right-auto h-6 w-3 transform-[translateY(-50%)]': !vertical,
            'bottom-auto left-[50%] h-3 w-6 transform-[translateX(-50%)]': vertical,
          },
        )
      "
      :style="vertical ? { top: `${+size + 2}px` } : { left: `${+size + 2}px` }"
      @click="() => onCollapse(index, 'end')"
    >
      <EndIcon />
    </div>
  </div>
</template>
