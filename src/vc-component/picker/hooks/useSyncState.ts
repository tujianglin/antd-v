import { ref, shallowRef, type Ref } from 'vue';

/**
 * Sync value with state.
 * This should only used for internal which not affect outside calculation.
 * Since it's not safe for suspense.
 */
export default function useSyncState<T>(
  defaultValue: Ref<T>,
  controlledValue?: T,
): [getter: (useControlledValueFirst?: boolean) => T, setter: (nextValue: T) => void, value: T] {
  const valueRef = shallowRef(defaultValue.value);
  const forceUpdate = ref(Symbol('update'));

  const getter = (useControlledValueFirst?: boolean) => {
    return useControlledValueFirst && controlledValue !== undefined ? controlledValue : valueRef.value;
  };

  const setter = (nextValue: T) => {
    valueRef.value = nextValue;
    forceUpdate.value = Symbol('update');
  };

  return [getter, setter, getter(true)];
}
