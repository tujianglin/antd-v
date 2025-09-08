import { computed, type Ref } from 'vue';
import type { CellRender, CellRenderInfo, SharedPickerProps } from '../../interface';

export default function useCellRender<DateType extends object = any>(
  cellRender: Ref<SharedPickerProps<DateType>['cellRender']>,
  range?: Ref<CellRenderInfo<DateType>['range']>,
) {
  // ======================== Render ========================
  // Merged render
  const mergedCellRender = computed(() => {
    if (cellRender.value) {
      return cellRender.value;
    }

    return (_current: DateType | number | string, info: CellRenderInfo<DateType>) => {
      return info.originNode;
    };
  });

  // Cell render
  const onInternalCellRender = computed<CellRender<DateType>>(() => {
    return (date, info) => mergedCellRender.value(date, { ...info, range: range?.value });
  });

  return onInternalCellRender;
}
