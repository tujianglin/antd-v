<script lang="tsx" setup>
import { Render } from '@/components';
import type { RenderNode } from '@/components/_util/type';
import raf from '@/vc-util/raf';
import clsx from 'clsx';
import { computed, onMounted, ref, toRefs } from 'vue';
import { useSemanticContextInject } from './SemanticContext';

export interface StepHandlerProps {
  prefixCls: string;
  upNode?: RenderNode;
  downNode?: RenderNode;
  upDisabled?: boolean;
  downDisabled?: boolean;
  onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void;
}

defineOptions({ inheritAttrs: false });

const { prefixCls, upNode, downNode, upDisabled, downDisabled, onStep } = defineProps<StepHandlerProps>();

const STEP_INTERVAL = 200;

const STEP_DELAY = 600;

const stepTimeoutRef = ref<any>();
const frameIds = ref<number[]>([]);

const onStepRef = ref<StepHandlerProps['onStep']>();

onMounted(() => {
  onStepRef.value = onStep;
  onStopStep();
  frameIds.value.forEach((id) => raf.cancel(id));
});

const { classNames, styles } = toRefs(useSemanticContextInject());

function onStopStep() {
  clearTimeout(stepTimeoutRef.value);
}

// We will interval update step when hold mouse down
function onStepMouseDown(e: MouseEvent, up: boolean) {
  e.preventDefault();
  onStopStep();
  onStepRef.value(up, 'handler');
  // Loop step for interval
  function loopStep() {
    onStepRef.value(up, 'handler');
    stepTimeoutRef.value = setTimeout(loopStep, STEP_INTERVAL);
  }
  // First time press will wait some time to trigger loop step update
  stepTimeoutRef.value = setTimeout(loopStep, STEP_DELAY);
}

// ======================= Render =======================

const handlerClassName = computed(() => `${prefixCls}-handler`);

const upClassName = computed(() =>
  clsx(handlerClassName.value, `${handlerClassName.value}-up`, {
    [`${handlerClassName.value}-up-disabled`]: upDisabled,
  }),
);
const downClassName = computed(() =>
  clsx(handlerClassName.value, `${handlerClassName.value}-down`, {
    [`${handlerClassName.value}-down-disabled`]: downDisabled,
  }),
);

// fix: https://github.com/ant-design/ant-design/issues/43088
// In Safari, When we fire onmousedown and onmouseup events in quick succession,
// there may be a problem that the onmouseup events are executed first,
// resulting in a disordered program execution.
// So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
const safeOnStopStep = () => frameIds.value.push(raf(onStopStep));

const sharedHandlerProps = {
  unselectable: 'on' as const,
  role: 'button',
  onMouseup: safeOnStopStep,
  onMouseleave: safeOnStopStep,
};
</script>
<template>
  <div :class="clsx(`${handlerClassName}-wrap`, classNames?.actions)" :style="styles?.actions">
    <span
      v-bind="sharedHandlerProps"
      @mousedown="(e) => onStepMouseDown(e, true)"
      aria-label="Increase Value"
      :aria-disabled="upDisabled"
      :class="upClassName"
    >
      <template v-if="upNode">
        <Render :content="upNode" />
      </template>
      <span v-else unselectable="on" :class="`${prefixCls}-handler-up-inner`"></span>
    </span>
    <span
      v-bind="sharedHandlerProps"
      @mousedown="(e) => onStepMouseDown(e, false)"
      aria-label="Decrease Value"
      :aria-disabled="downDisabled"
      :class="downClassName"
    >
      <template v-if="downNode">
        <Render :content="downNode" />
      </template>
      <span v-else unselectable="on" :class="`${prefixCls}-handler-down-inner`"></span>
    </span>
  </div>
</template>
