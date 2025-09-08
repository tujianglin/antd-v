import warning from '@/vc-util/warning';
import { computed, type ComputedRef, type Ref } from 'vue';
import type { ValueDate } from '../../interface';

export default function usePresets<DateType = any>(
  presets?: Ref<ValueDate<DateType>[]>,
  legacyRanges?: Ref<Record<string, DateType | (() => DateType)>>,
): ComputedRef<ValueDate<DateType>[]> {
  return computed(() => {
    if (presets.value) {
      return presets.value;
    }

    if (legacyRanges?.value) {
      warning(false, '`ranges` is deprecated. Please use `presets` instead.');

      return Object.entries(legacyRanges.value).map(([label, value]) => ({ label, value }));
    }

    return [];
  });
}
