import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import canUseDom from '../../vc-util/Dom/canUseDom';
import { useOrderContextInject, type QueueCreate } from './context';

const EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
export default function useDom(render: Ref<boolean>, debug?: string): [Ref<HTMLDivElement>, Ref<QueueCreate>] {
  const ele = computed(() => {
    if (!canUseDom()) {
      return null;
    }

    const defaultEle = document.createElement('div');

    if (process.env.NODE_ENV !== 'production' && debug) {
      defaultEle.setAttribute('data-debug', debug);
    }

    return defaultEle;
  });

  // ========================== Order ==========================
  const appendedRef = ref(false);

  const queueCreate = useOrderContextInject();
  const queue = ref<VoidFunction[]>(EMPTY_LIST);

  const mergedQueueCreate = computed(
    () =>
      queueCreate ||
      (appendedRef.value
        ? undefined
        : (appendFn: VoidFunction) => {
            const newQueue = [appendFn, ...queue.value];
            queue.value = newQueue;
          }),
  );

  // =========================== DOM ===========================
  function append() {
    if (!ele.value.parentElement) {
      document.body.appendChild(ele.value);
    }

    appendedRef.value = true;
  }

  function cleanup() {
    ele.value.parentElement?.removeChild(ele.value);

    appendedRef.value = false;
  }

  watch(
    render,
    async (val) => {
      await nextTick();
      if (val) {
        if (queueCreate) {
          queueCreate(append);
        } else {
          append();
        }
      } else {
        cleanup();
      }
    },
    { flush: 'post', immediate: true },
  );

  onBeforeUnmount(() => {
    cleanup();
  });

  watch(
    queue,
    (val) => {
      if (val.length) {
        val.forEach((appendFn) => appendFn());
        queue.value = EMPTY_LIST;
      }
    },
    { immediate: true, deep: true },
  );

  return [ele, mergedQueueCreate];
}
