import { computed, ref, toRefs, watch, type Ref } from 'vue';
import type { LegacyKey } from '../Cascader.vue';
import { useCascaderContextInject } from '../context';

/**
 * Control the active open options path.
 */
const useActive = (multiple?: Ref<boolean>, open?: Ref<boolean>): Ref<LegacyKey[]> => {
  const { values } = toRefs(useCascaderContextInject());

  const firstValueCells = computed(() => values.value[0]);

  // Record current dropdown active options
  // This also control the open status
  const activeValueCells = ref<LegacyKey[]>([]);

  watch(
    [open, firstValueCells],
    () => {
      if (!multiple.value) {
        activeValueCells.value = firstValueCells.value || [];
      }
    },
    { immediate: true, deep: true },
  );

  return activeValueCells;
};

export default useActive;
