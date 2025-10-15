import { computed, type Ref } from 'vue';
import type { InternalMode, PanelMode } from '../../interface';

export default function useShowNow(picker: Ref<InternalMode>, mode: Ref<PanelMode>, showNow?: Ref<boolean>) {
  return computed(() => {
    if (mode.value !== 'date' && mode.value !== 'time') {
      return false;
    }

    if (showNow.value === true) {
      return showNow.value;
    }

    return picker.value === 'date' || picker.value === 'time';
  });
}
