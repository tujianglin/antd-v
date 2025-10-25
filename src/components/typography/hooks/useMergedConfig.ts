import { computed, type ComputedRef, type Ref } from 'vue';

export default function useMergedConfig<Target>(
  propConfig: Ref<any>,
  templateConfig?: Ref<Target>,
): [ComputedRef<boolean>, ComputedRef<Target>] {
  const config = computed(() => {
    const support = !!propConfig.value;

    return [
      support,
      {
        ...templateConfig?.value,
        ...(support && typeof propConfig.value === 'object' ? propConfig.value : null),
      },
    ] as const;
  });

  return [computed(() => config.value?.[0]), computed(() => config.value?.[1])];
}
