/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import type { MotionStatus, StepStatus } from '../interface';
import { STEP_ACTIVATED, STEP_ACTIVE, STEP_NONE, STEP_PREPARE, STEP_PREPARED, STEP_START } from '../interface';
import useNextFrame from './useNextFrame';

const FULL_STEP_QUEUE: StepStatus[] = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED];

const SIMPLE_STEP_QUEUE: StepStatus[] = [STEP_PREPARE, STEP_PREPARED];

/** Skip current step */
export const SkipStep = false as const;
/** Current step should be update in */
export const DoStep = true as const;

export function isActive(step: StepStatus) {
  return step === STEP_ACTIVE || step === STEP_ACTIVATED;
}

export default (
  status: Ref<MotionStatus>,
  prepareOnly: Ref<boolean>,
  callback: (step: StepStatus) => Promise<void> | void | typeof SkipStep | typeof DoStep,
): [() => void, Ref<StepStatus>] => {
  const step = ref<StepStatus>(STEP_NONE);

  const [nextFrame, cancelNextFrame] = useNextFrame();

  function startQueue() {
    step.value = STEP_PREPARE;
  }

  const STEP_QUEUE = computed(() => (prepareOnly.value ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE));

  watch(
    [status, step],
    async () => {
      await nextTick();
      if (step.value !== STEP_NONE && step.value !== STEP_ACTIVATED) {
        const index = STEP_QUEUE.value.indexOf(step.value);
        const nextStep = STEP_QUEUE.value[index + 1];

        const result = callback(step.value);

        if (result === SkipStep) {
          // Skip when no needed
          step.value = nextStep;
        } else if (nextStep) {
          // Do as frame for step update
          nextFrame((info) => {
            function doNext() {
              // Skip since current queue is ood
              if (info.isCanceled()) return;

              step.value = nextStep;
            }

            if (result === true) {
              doNext();
            } else {
              // Only promise should be async
              Promise.resolve(result).then(doNext);
            }
          });
        }
      }
    },
    { immediate: true, flush: 'post' },
  );

  onBeforeUnmount(() => {
    cancelNextFrame();
  });

  return [startQueue, step];
};
