import { computed, type ComputedRef } from 'vue';

export type Orientation = 'horizontal' | 'vertical';

const isValidOrientation = (orientation?: Orientation) => {
  return orientation === 'horizontal' || orientation === 'vertical';
};

export default function useOrientation(
  orientation?: ComputedRef<Orientation>,
  vertical?: ComputedRef<boolean>,
  legacyDirection?: ComputedRef<Orientation>,
) {
  const mergedOrientation = computed(() => {
    const validOrientation = isValidOrientation(orientation.value);
    let result: Orientation;
    if (validOrientation) {
      result = orientation.value;
    } else if (typeof vertical.value === 'boolean') {
      result = vertical.value ? 'vertical' : 'horizontal';
    } else {
      const validLegacyDirection = isValidOrientation(legacyDirection?.value);
      result = validLegacyDirection ? legacyDirection?.value : 'horizontal';
    }
    return result;
  });
  return [mergedOrientation, computed(() => mergedOrientation.value === 'vertical')] as const;
}
