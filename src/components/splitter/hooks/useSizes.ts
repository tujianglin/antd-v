import { computed, onMounted, ref, type Ref } from 'vue';
import type { PanelProps } from '../interface';
import { autoPtgSizes } from './sizeUtil';

export function getPtg(str: string) {
  return Number(str.slice(0, -1)) / 100;
}

function isPtg(itemSize: string | number | undefined): itemSize is string {
  return typeof itemSize === 'string' && itemSize.endsWith('%');
}
export default function useSizes(items: Ref<PanelProps[]>, containerSize?: Ref<number>) {
  const propSizes = computed(() => items.value.map((item) => item.size));

  const itemsCount = computed(() => items.value.length);

  const mergedContainerSize = computed(() => containerSize.value || 0);
  const ptg2px = computed(() => (ptg: number) => ptg * mergedContainerSize.value);

  const innerSizes = ref<(string | number)[]>([]);
  onMounted(() => {
    innerSizes.value = items.value.map((item) => item.defaultSize);
  });
  const sizes = computed(() => {
    const mergedSizes: PanelProps['size'][] = [];

    for (let i = 0; i < itemsCount.value; i += 1) {
      mergedSizes[i] = propSizes.value[i] ?? innerSizes.value[i];
    }

    return mergedSizes;
  });

  const postPercentMinSizes = computed(() =>
    items.value.map((item) => {
      if (isPtg(item.min)) {
        return getPtg(item.min);
      }
      return (item.min || 0) / mergedContainerSize.value;
    }),
  );

  const postPercentMaxSizes = computed(() =>
    items.value.map((item) => {
      if (isPtg(item.max)) {
        return getPtg(item.max);
      }
      return (item.max || mergedContainerSize.value) / mergedContainerSize.value;
    }),
  );

  // Post handle the size. Will do:
  // 1. Convert all the px into percentage if not empty.
  // 2. Get rest percentage for exist percentage.
  // 3. Fill the rest percentage into empty item.
  const postPercentSizes = computed(() => {
    const ptgList: (number | undefined)[] = [];

    // Fill default percentage
    for (let i = 0; i < itemsCount.value; i += 1) {
      const itemSize = sizes.value[i];

      if (isPtg(itemSize)) {
        ptgList[i] = getPtg(itemSize);
      } else if (itemSize || itemSize === 0) {
        const num = Number(itemSize);
        if (!Number.isNaN(num)) {
          ptgList[i] = num / mergedContainerSize.value;
        }
      } else {
        ptgList[i] = undefined;
      }
    }

    // Use autoPtgSizes to handle the undefined sizes
    return autoPtgSizes(ptgList, postPercentMinSizes.value, postPercentMaxSizes.value);
  });

  const postPxSizes = computed(() => postPercentSizes.value.map((i) => ptg2px.value(i)));

  const panelSizes = computed(() => (containerSize.value ? postPxSizes.value : sizes.value));

  return [panelSizes, postPxSizes, postPercentSizes, postPercentMinSizes, postPercentMaxSizes, innerSizes] as const;
}
