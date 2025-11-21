<script lang="tsx" setup>
import raf from '@/vc-util/raf';
import clsx from 'clsx';
import { computed, onMounted, ref, type CSSProperties } from 'vue';

export interface StepHandlerProps {
  prefixCls: string;
  action: 'up' | 'down';
  disabled?: boolean;
  class?: string;
  style?: CSSProperties;
  onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void;
}

defineOptions({ inheritAttrs: false });

const { prefixCls, action, disabled, class: className, style, onStep } = defineProps<StepHandlerProps>();

// ======================== MISC ========================
const isUpAction = computed(() => action === 'up');

const STEP_INTERVAL = 200;

const STEP_DELAY = 600;

const stepTimeoutRef = ref<any>();
const frameIds = ref<number[]>([]);

function onStopStep() {
  clearTimeout(stepTimeoutRef.value);
}

// We will interval update step when hold mouse down
function onStepMouseDown(e) {
  e.preventDefault();
  onStopStep();

  onStep(isUpAction.value, 'handler');

  // Loop step for interval
  function loopStep() {
    onStep(isUpAction.value, 'handler');

    stepTimeoutRef.value = setTimeout(loopStep, STEP_INTERVAL);
  }

  // First time press will wait some time to trigger loop step update
  stepTimeoutRef.value = setTimeout(loopStep, STEP_DELAY);
}

onMounted(() => {
  onStopStep();
  frameIds.value.forEach((id) => raf.cancel(id));
});

// ======================= Render =======================
const actionClassName = computed(() => `${prefixCls}-action`);

const mergedClassName = computed(() =>
  clsx(
    actionClassName.value,
    `${actionClassName.value}-${action}`,
    {
      [`${actionClassName.value}-${action}-disabled`]: disabled,
    },
    className,
  ),
);

// fix: https://github.com/ant-design/ant-design/issues/43088
// In Safari, When we fire onmousedown and onmouseup events in quick succession,
// there may be a problem that the onmouseup events are executed first,
// resulting in a disordered program execution.
// So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
const safeOnStopStep = () => frameIds.value.push(raf(onStopStep));
</script>
<template>
  <span
    unselectable="on"
    role="button"
    @mouseup="safeOnStopStep"
    @mouseleave="safeOnStopStep"
    @mousedown="onStepMouseDown"
    :aria-label="isUpAction ? 'Increase Value' : 'Decrease Value'"
    :aria-disabled="disabled"
    :class="mergedClassName"
    :style="style"
  >
    <slot>
      <span unselectable="on" :class="`${prefixCls}-action-${action}-inner`"></span>
    </slot>
  </span>
</template>
