import { computed, nextTick, onBeforeUnmount, ref, toRefs, watch, type CSSProperties, type Reactive, type Ref } from 'vue';
import type { CSSMotionProps } from '../CSSMotion.vue';
import type { MotionEvent, MotionEventHandler, MotionPrepareEventHandler, MotionStatus, StepStatus } from '../interface';
import {
  STATUS_APPEAR,
  STATUS_ENTER,
  STATUS_LEAVE,
  STATUS_NONE,
  STEP_ACTIVE,
  STEP_PREPARE,
  STEP_PREPARED,
  STEP_START,
} from '../interface';
import useDomMotionEvents from './useDomMotionEvents';
import useStepQueue, { DoStep, isActive, SkipStep } from './useStepQueue';

export default function useStatus(
  supportMotion: Ref<boolean>,
  visible: Ref<boolean>,
  getElement: () => HTMLElement,
  props: Reactive<CSSMotionProps>,
): [Ref<MotionStatus>, Ref<StepStatus>, Ref<CSSProperties>, Ref<boolean>] {
  const {
    motionDeadline,
    motionLeaveImmediately,
    onAppearPrepare,
    onEnterPrepare,
    onLeavePrepare,
    onAppearStart,
    onEnterStart,
    onLeaveStart,
    onAppearActive,
    onEnterActive,
    onLeaveActive,
    onAppearEnd,
    onEnterEnd,
    onLeaveEnd,
    onVisibleChanged,
  } = toRefs(props);

  const motionEnter = computed(() => props.motionEnter ?? true);
  const motionAppear = computed(() => props.motionAppear ?? true);
  const motionLeave = computed(() => props.motionLeave ?? true);

  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const asyncVisible = ref<boolean>();
  const status = ref<MotionStatus>(STATUS_NONE);
  const style = ref<CSSProperties | undefined>(null);

  const mountedRef = ref(false);
  const deadlineRef = ref(null);

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement();
  }

  // ========================== Motion End ==========================
  const activeRef = ref(false);

  /**
   * Clean up status & style
   */
  function updateMotionEndStatus() {
    status.value = STATUS_NONE;
    style.value = null;
  }

  const onInternalMotionEnd = (event: MotionEvent) => {
    // Do nothing since not in any transition status.
    // This may happen when `motionDeadline` trigger.
    if (status.value === STATUS_NONE) {
      return;
    }

    const element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return;
    }

    const currentActive = activeRef.value;

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let canEnd: boolean | void;
    if (status.value === STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd.value?.(element, event);
    } else if (status.value === STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd.value?.(element, event);
    } else if (status.value === STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd.value?.(element, event);
    }
    // Only update status when `canEnd` and not destroyed
    if (currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  };

  const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd);

  // ============================= Step =============================
  const getEventHandlers = (targetStatus: MotionStatus) => {
    switch (targetStatus) {
      case STATUS_APPEAR:
        return {
          [STEP_PREPARE]: onAppearPrepare.value,
          [STEP_START]: onAppearStart.value,
          [STEP_ACTIVE]: onAppearActive.value,
        };

      case STATUS_ENTER:
        return {
          [STEP_PREPARE]: onEnterPrepare.value,
          [STEP_START]: onEnterStart.value,
          [STEP_ACTIVE]: onEnterActive.value,
        };

      case STATUS_LEAVE:
        return {
          [STEP_PREPARE]: onLeavePrepare.value,
          [STEP_START]: onLeaveStart.value,
          [STEP_ACTIVE]: onLeaveActive.value,
        };

      default:
        return {};
    }
  };

  const eventHandlers = computed<{
    [STEP_PREPARE]?: boolean | MotionPrepareEventHandler;
    [STEP_START]?: MotionEventHandler;
    [STEP_ACTIVE]?: MotionEventHandler;
  }>(() => getEventHandlers(status.value));

  const [startStep, step] = useStepQueue(
    status,
    computed(() => !supportMotion.value),
    (newStep) => {
      // Only prepare step can be skip
      if (newStep === STEP_PREPARE) {
        const onPrepare = eventHandlers.value[STEP_PREPARE];
        if (!onPrepare) {
          return SkipStep;
        }
        return (onPrepare as any)(getDomElement());
      }

      // Rest step is sync update
      if (step.value in eventHandlers.value) {
        style.value = eventHandlers.value[step.value]?.(getDomElement(), null) || null;
      }

      if (step.value === STEP_ACTIVE && status.value !== STATUS_NONE) {
        // Patch events when motion needed
        patchMotionEvents(getDomElement());

        if (motionDeadline.value > 0) {
          clearTimeout(deadlineRef.value);
          deadlineRef.value = setTimeout(() => {
            onInternalMotionEnd({
              deadline: true,
            } as MotionEvent);
          }, motionDeadline.value);
        }
      }

      if (step.value === STEP_PREPARED) {
        updateMotionEndStatus();
      }

      return DoStep;
    },
  );

  const active = computed(() => isActive(step.value));
  watch(
    () => active.value,
    () => {
      activeRef.value = active.value;
    },
  );

  // ============================ Status ============================
  const visibleRef = ref<boolean | null>(null);

  // Update with new status
  watch(
    () => visible.value,
    async () => {
      await nextTick();
      // When use Suspense, the `visible` will repeat trigger,
      // But not real change of the `visible`, we need to skip it.
      // https://github.com/ant-design/ant-design/issues/44379
      if (mountedRef.value && visibleRef.value === visible.value) {
        return;
      }

      asyncVisible.value = visible.value;

      const isMounted = mountedRef.value;
      mountedRef.value = true;

      // if (!supportMotion) {
      //   return;
      // }

      let nextStatus: MotionStatus;

      // Appear
      if (!isMounted && visible.value && motionAppear.value) {
        nextStatus = STATUS_APPEAR;
      }

      // Enter
      if (isMounted && visible.value && motionEnter.value) {
        nextStatus = STATUS_ENTER;
      }

      // Leave
      if (
        (isMounted && !visible.value && motionLeave.value) ||
        (!isMounted && motionLeaveImmediately.value && !visible.value && motionLeave.value)
      ) {
        nextStatus = STATUS_LEAVE;
      }

      const nextEventHandlers = getEventHandlers(nextStatus);
      // Update to next status
      if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
        status.value = nextStatus;
        startStep();
      } else {
        // Set back in case no motion but prev status has prepare step
        status.value = STATUS_NONE;
      }

      visibleRef.value = visible.value;
    },
    { immediate: true, flush: 'post' },
  );

  // ============================ Effect ============================
  // Reset when motion changed
  watch(
    [motionAppear, motionEnter, motionLeave],
    () => {
      if (
        // Cancel appear
        (status.value === STATUS_APPEAR && !motionAppear.value) ||
        // Cancel enter
        (status.value === STATUS_ENTER && !motionEnter.value) ||
        // Cancel leave
        (status.value === STATUS_LEAVE && !motionLeave.value)
      ) {
        status.value = STATUS_NONE;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    mountedRef.value = false;
    clearTimeout(deadlineRef.value);
  });

  // Trigger `onVisibleChanged`
  const firstMountChangeRef = ref(false);
  watch(
    [asyncVisible, status],
    () => {
      // [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
      if (asyncVisible.value) {
        firstMountChangeRef.value = true;
      }

      if (asyncVisible.value !== undefined && status.value === STATUS_NONE) {
        // Skip first render is invisible since it's nothing changed
        if (firstMountChangeRef.value || asyncVisible.value) {
          onVisibleChanged.value?.(asyncVisible.value);
        }
        firstMountChangeRef.value = true;
      }
    },
    { immediate: true },
  );

  // ============================ Styles ============================
  const mergedStyle = computed(() => {
    let result = style.value;
    if (eventHandlers.value[STEP_PREPARE] && step.value === STEP_START) {
      result = {
        transition: 'none',
        ...result,
      };
    }
    return result;
  });

  return [status, step, mergedStyle, computed(() => asyncVisible.value ?? visible.value)];
}
