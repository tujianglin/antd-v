import { computed, onMounted, ref, type Ref } from 'vue';
import type { PanelProps } from '../interface';

export function getPtg(str: string) {
  return Number(str.slice(0, -1)) / 100;
}

function isPtg(itemSize: string | number | undefined): itemSize is string {
  return typeof itemSize === 'string' && itemSize.endsWith('%');
}
export default function useSizes(items: Ref<PanelProps[]>, containerSize?: Ref<number>) {
  const itemsCount = computed(() => items.value.length);

  const mergedContainerSize = computed(() => containerSize.value || 0);
  const ptg2px = computed(() => (ptg: number) => ptg * mergedContainerSize.value);

  const innerSizes = ref<(string | number)[]>([]);
  onMounted(() => {
    innerSizes.value = items.value.map((item) => item.defaultSize);
  });
  const sizes = computed(() => {
    const mergedSizes = [];
    for (let i = 0; i < itemsCount.value; i += 1) {
      mergedSizes[i] = innerSizes.value[i];
    }
    return mergedSizes;
  });

  const postPercentSizes = computed(() => {
    let ptgList: (number | undefined)[] = [];
    let emptyCount = 0;
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
        emptyCount += 1;
        ptgList[i] = undefined;
      }
    }

    const totalPtg = ptgList.reduce<number>((acc, ptg) => acc + (ptg || 0), 0);

    if (totalPtg > 1 || !emptyCount) {
      const scale = 1 / totalPtg;
      ptgList = ptgList.map((ptg) => (ptg === undefined ? 0 : ptg * scale));
    } else {
      const avgRest = (1 - totalPtg) / emptyCount;
      ptgList = ptgList.map((ptg) => (ptg === undefined ? avgRest : ptg));
    }

    return ptgList as number[];
  });

  const postPxSizes = computed(() => postPercentSizes.value.map((i) => ptg2px.value(i)));

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

  const panelSizes = computed(() => (containerSize.value ? postPxSizes.value : sizes.value));

  return [panelSizes, postPxSizes, postPercentSizes, postPercentMinSizes, postPercentMaxSizes, innerSizes] as const;
}
