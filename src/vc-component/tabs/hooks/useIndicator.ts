import raf from '@/vc-util/raf';
import { computed, onBeforeUnmount, ref, shallowRef, toRefs, watch, type CSSProperties, type Reactive } from 'vue';
import type { TabOffset } from '../interface';

export type GetIndicatorSize = number | ((origin: number) => number);

interface UseIndicatorOptions {
  activeTabOffset: TabOffset;
  horizontal: boolean;
  rtl: boolean;
  indicator?: {
    size?: GetIndicatorSize;
    align?: 'start' | 'center' | 'end';
  };
}

const useIndicator = (options: Reactive<UseIndicatorOptions>) => {
  const { activeTabOffset, horizontal, rtl } = toRefs(options);
  const indicator = computed(() => options.indicator || {});
  const size = computed(() => indicator.value.size);
  const align = computed(() => indicator.value.align || 'center');

  const inkStyle = ref<CSSProperties>();
  const inkBarRafRef = shallowRef<number>();

  const getLength = (origin: number) => {
    if (typeof size.value === 'function') {
      return size.value(origin);
    }
    if (typeof size.value === 'number') {
      return size.value;
    }
    return origin;
  };

  // Delay set ink style to avoid remove tab blink
  function cleanInkBarRaf() {
    raf.cancel(inkBarRafRef.value);
  }

  watch(
    [activeTabOffset, horizontal, rtl, align],
    () => {
      const newInkStyle: CSSProperties = {};

      if (activeTabOffset.value) {
        if (horizontal.value) {
          newInkStyle.width = `${getLength(activeTabOffset.value.width)}px`;
          const key = rtl.value ? 'right' : 'left';
          if (align.value === 'start') {
            newInkStyle[key] = `${activeTabOffset.value[key]}px`;
          }
          if (align.value === 'center') {
            newInkStyle[key] = `${activeTabOffset.value[key] + activeTabOffset.value.width / 2}px`;
            newInkStyle.transform = rtl.value ? 'translateX(50%)' : 'translateX(-50%)';
          }
          if (align.value === 'end') {
            newInkStyle[key] = `${activeTabOffset.value[key] + activeTabOffset.value.width}px`;
            newInkStyle.transform = 'translateX(-100%)';
          }
        } else {
          newInkStyle.height = `${getLength(activeTabOffset.value.height)}px`;
          if (align.value === 'start') {
            newInkStyle.top = `${activeTabOffset.value.top}px`;
          }
          if (align.value === 'center') {
            newInkStyle.top = `${activeTabOffset.value.top + activeTabOffset.value.height / 2}px`;
            newInkStyle.transform = 'translateY(-50%)';
          }
          if (align.value === 'end') {
            newInkStyle.top = `${activeTabOffset.value.top + activeTabOffset.value.height}px`;
            newInkStyle.transform = 'translateY(-100%)';
          }
        }
      }

      cleanInkBarRaf();
      inkBarRafRef.value = raf(() => {
        // Avoid jitter caused by tiny numerical differences
        // fix https://github.com/ant-design/ant-design/issues/53378
        const isEqual =
          inkStyle.value &&
          newInkStyle &&
          Object.keys(newInkStyle).every((key) => {
            const newValue = newInkStyle[key];
            const oldValue = inkStyle.value[key];
            return typeof newValue === 'number' && typeof oldValue === 'number'
              ? Math.round(newValue) === Math.round(oldValue)
              : newValue === oldValue;
          });
        if (!isEqual) {
          inkStyle.value = newInkStyle;
        }
      });
    },
    { immediate: true, deep: true },
  );

  onBeforeUnmount(() => {
    cleanInkBarRaf();
  });

  return { style: inkStyle };
};

export default useIndicator;
