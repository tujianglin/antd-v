import { onBeforeUnmount, ref, shallowRef } from 'vue';

export type Updater<State> = (prev: State) => State;

/**
 * Execute code before next frame but async
 */
export function useLayoutState<State>(defaultState: State): [State, (updater: Updater<State>) => void] {
  const stateRef = shallowRef(defaultState);
  const forceUpdate = ref(0);

  const lastPromiseRef = shallowRef<Promise<void>>(null);
  const updateBatchRef = shallowRef<Updater<State>[]>([]);

  function setFrameState(updater: Updater<State>) {
    updateBatchRef.value.push(updater);

    const promise = Promise.resolve();
    lastPromiseRef.value = promise;

    promise.then(() => {
      if (lastPromiseRef.value === promise) {
        const prevBatch = updateBatchRef.value;
        const prevState = stateRef.value;
        updateBatchRef.value = [];

        prevBatch.forEach((batchUpdater) => {
          stateRef.value = batchUpdater(stateRef.value);
        });

        lastPromiseRef.value = null;

        if (prevState !== stateRef.value) {
          forceUpdate.value += 1;
        }
      }
    });
  }

  onBeforeUnmount(() => {
    lastPromiseRef.value = null;
  });

  return [stateRef.value, setFrameState];
}

/** Lock frame, when frame pass reset the lock. */
export function useTimeoutLock<State>(defaultState?: State): [(state: State) => void, () => State | null] {
  const frameRef = shallowRef<State | null>(defaultState || null);
  const timeoutRef = shallowRef<ReturnType<typeof setTimeout> | null>(null);

  function cleanUp() {
    clearTimeout(timeoutRef.value);
  }

  function setState(newState: State) {
    frameRef.value = newState;
    cleanUp();

    timeoutRef.value = setTimeout(() => {
      frameRef.value = null;
      timeoutRef.value = undefined;
    }, 100);
  }

  function getState() {
    return frameRef.value;
  }

  onBeforeUnmount(() => cleanUp);

  return [setState, getState];
}
