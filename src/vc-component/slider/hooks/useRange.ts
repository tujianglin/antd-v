import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import { type Reactive, type Ref } from 'vue';
import type { SliderProps } from '../Slider.vue';

export default function useRange(range?: Ref<SliderProps['range']>): Reactive<{
  rangeEnabled: boolean;
  rangeEditable: boolean;
  rangeDraggableTrack: boolean;
  minCount: number;
  maxCount?: number;
}> {
  return reactiveComputed(() => {
    if (range.value === true || !range.value) {
      return {
        rangeEnabled: !!range.value,
        rangeEditable: false,
        rangeDraggableTrack: false,
        minCount: 0,
        maxCount: undefined,
      };
    }

    const { editable, draggableTrack, minCount, maxCount } = range.value;

    if (process.env.NODE_ENV !== 'production') {
      warning(!editable || !draggableTrack, '`editable` can not work with `draggableTrack`.');
    }

    return {
      rangeEnabled: true,
      rangeEditable: editable,
      rangeDraggableTrack: !editable && draggableTrack,
      minCount: minCount || 0,
      maxCount,
    };
  });
}
