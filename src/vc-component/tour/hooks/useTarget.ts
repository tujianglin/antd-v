import { computed, onBeforeUnmount, ref, toRaw, watch, watchEffect, type Ref } from 'vue';
import type { TourStepInfo } from '..';
import { isInViewPort } from '../util';

export interface Gap {
  offset?: number | [number, number];
  radius?: number;
}

export interface PosInfo {
  left: number;
  top: number;
  height: number;
  width: number;
  radius: number;
}
function isValidNumber(val) {
  return typeof val === 'number' && !Number.isNaN(val);
}

export default function useTarget(
  target: Ref<TourStepInfo['target']>,
  open: Ref<boolean>,
  gap?: Ref<Gap>,
  scrollIntoViewOptions?: Ref<boolean | ScrollIntoViewOptions>,
  inlineMode?: Ref<boolean>,
  placeholderRef?: Ref<{ el: HTMLDivElement }>,
): [Ref<PosInfo>, Ref<HTMLElement>] {
  // ========================= Target =========================
  // We trade `undefined` as not get target by function yet.
  // `null` as empty target.
  const targetElement = ref<null | HTMLElement | undefined>(undefined);

  watchEffect(() => {
    const nextElement = typeof target.value === 'function' ? (target.value as any)() : target.value;
    targetElement.value = nextElement || null;
  });

  // ========================= Align ==========================
  const posInfo = ref<PosInfo>(null);

  const updatePos = () => {
    if (targetElement.value) {
      if (!inlineMode.value && !isInViewPort(targetElement.value) && open) {
        targetElement.value.scrollIntoView(scrollIntoViewOptions.value);
      }

      const { left, top, width, height } = targetElement.value.getBoundingClientRect();
      const nextPosInfo: PosInfo = { left, top, width, height, radius: 0 };
      // If `inlineMode` we need cut off parent offset
      if (inlineMode.value) {
        const parentRect = placeholderRef.value?.el?.parentElement?.getBoundingClientRect();
        if (parentRect) {
          nextPosInfo.left -= parentRect.left;
          nextPosInfo.top -= parentRect.top;
        }
      }

      if (JSON.stringify(toRaw(posInfo.value)) !== JSON.stringify(nextPosInfo)) {
        posInfo.value = nextPosInfo;
      }
    } else {
      // Not exist target which means we just show in center
      posInfo.value = null;
    }
  };

  const getGapOffset = (index: number) => (Array.isArray(gap.value?.offset) ? gap.value?.offset[index] : gap.value?.offset) ?? 6;

  watch(
    [targetElement, open],
    () => {
      updatePos();
      // update when window resize
      window.addEventListener('resize', updatePos);
      // update when `document.body.style.overflow` is set to visible
      // by default, it will be set to hidden
      window.addEventListener('scroll', updatePos);
    },
    { immediate: true, flush: 'post' },
  );

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePos);
    window.removeEventListener('scroll', updatePos);
  });

  // ======================== PosInfo =========================
  const mergedPosInfo = computed(() => {
    if (!posInfo.value) {
      return posInfo.value;
    }

    const gapOffsetX = getGapOffset(0);
    const gapOffsetY = getGapOffset(1);
    const gapRadius = isValidNumber(gap.value?.radius) ? gap.value?.radius : 2;

    return {
      left: posInfo.value.left - gapOffsetX,
      top: posInfo.value.top - gapOffsetY,
      width: posInfo.value.width + gapOffsetX * 2,
      height: posInfo.value.height + gapOffsetY * 2,
      radius: gapRadius,
    };
  });

  return [mergedPosInfo, targetElement];
}
