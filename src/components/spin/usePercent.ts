import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from 'vue';

const AUTO_INTERVAL = 200;
const STEP_BUCKETS: [limit: number, stepPtg: number][] = [
  [30, 0.05],
  [70, 0.03],
  [96, 0.01],
];

export default function usePercent(spinning: Ref<boolean>, percent?: Ref<number | 'auto'>): ComputedRef<number> {
  const mockPercent = ref(0);
  const mockIntervalRef = ref<ReturnType<typeof setInterval>>(null);

  const isAuto = computed(() => percent?.value === 'auto');

  watch(
    [isAuto, spinning],
    () => {
      if (isAuto.value && spinning.value) {
        mockPercent.value = 0;

        mockIntervalRef.value = setInterval(() => {
          const restPTG = 100 - mockPercent.value;

          for (let i = 0; i < STEP_BUCKETS.length; i += 1) {
            const [limit, stepPtg] = STEP_BUCKETS[i];

            if (mockPercent.value <= limit) {
              return (mockPercent.value = mockPercent.value + restPTG * stepPtg);
            }
          }
        }, AUTO_INTERVAL);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearInterval(mockIntervalRef.value!);
  });

  return computed(() => (isAuto.value ? mockPercent.value : (percent?.value as any)));
}
