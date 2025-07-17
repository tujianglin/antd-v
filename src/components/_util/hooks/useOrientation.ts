import { reactiveComputed } from '@vueuse/core';
import type { ComputedRef } from 'vue';

export type Orientation = 'horizontal' | 'vertical';

const isValidOrientation = (orientation?: Orientation) => {
  return orientation === 'horizontal' || orientation === 'vertical';
};

export default function useOrientation(
  orientation?: ComputedRef<Orientation>,
  vertical?: ComputedRef<boolean>,
  legacyDirection?: ComputedRef<Orientation>,
): { mergedOrientation: Orientation; mergedVertical: boolean } {
  return reactiveComputed(() => {
    const validOrientation = isValidOrientation(orientation.value);
    let mergedOrientation: Orientation;
    if (validOrientation) {
      mergedOrientation = orientation.value;
    } else if (typeof vertical.value === 'boolean') {
      mergedOrientation = vertical.value ? 'vertical' : 'horizontal';
    } else {
      const validLegacyDirection = isValidOrientation(legacyDirection?.value);
      mergedOrientation = validLegacyDirection ? legacyDirection?.value : 'horizontal';
    }

    return { mergedOrientation, mergedVertical: mergedOrientation === 'vertical' };
  });
}
