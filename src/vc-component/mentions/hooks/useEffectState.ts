import { ref, watch } from 'vue';

export type Trigger = (callback?: VoidFunction) => void;

/**
 * Trigger a callback on state change
 */
export default function useEffectState(): Trigger {
  const effectId = ref<{ id: number; callback: VoidFunction | null }>({
    id: 0,
    callback: null,
  });

  const update = (callback?: VoidFunction) => {
    effectId.value = {
      id: effectId.value.id + 1,
      callback,
    };
  };

  watch(
    effectId,
    () => {
      effectId.value.callback?.();
    },
    { immediate: true, deep: true },
  );

  return update;
}
