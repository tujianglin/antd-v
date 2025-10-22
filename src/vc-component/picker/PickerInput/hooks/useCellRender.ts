import type { DateType } from '@/vc-util/type';
import { computed, type Ref } from 'vue';
import type { CellRender, CellRenderInfo, SharedPickerProps } from '../../interface';

export default function useCellRender(cellRender: Ref<SharedPickerProps['cellRender']>, range?: Ref<CellRenderInfo['range']>) {
  // ======================== Render ========================
  // Merged render
  const mergedCellRender = computed(() => {
    if (cellRender.value) {
      return cellRender.value;
    }

    return (_current: DateType | number | string, info: CellRenderInfo) => {
      return info.originNode;
    };
  });

  // Cell render
  const onInternalCellRender = computed<CellRender>(() => {
    return (date, info) => mergedCellRender.value(date, { ...info, range: range?.value });
  });

  return onInternalCellRender;
}
