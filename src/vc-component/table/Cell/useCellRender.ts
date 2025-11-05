import { isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import getValue from '@/vc-util/utils/get';
import { computed, type ComputedRef, type Ref } from 'vue';
import { usePerfContextInject } from '../context/PerfContext';
import type { CellType, ColumnType, DataIndex, RenderedCell } from '../interface';
import { validateValue } from '../utils/valueUtil';

function isRenderCell<RecordType>(data: VueNode | RenderedCell<RecordType>): data is RenderedCell<RecordType> {
  return data && typeof data === 'object' && !Array.isArray(data) && !isValidElement(data);
}

export default function useCellRender<RecordType>(
  record: Ref<RecordType>,
  dataIndex: Ref<DataIndex<RecordType>>,
  renderIndex: Ref<number>,
  children?: Ref<VueNode>,
  render?: ColumnType<RecordType>['render'],
): [ComputedRef<VueNode>, ComputedRef<CellType<RecordType>>] {
  // TODO: Remove this after next major version
  const perfRecord = usePerfContextInject();

  // ======================== Render ========================
  const retData = computed(() => {
    if (validateValue(children.value)) {
      return [children.value];
    }

    const path =
      dataIndex.value === null || dataIndex.value === undefined || dataIndex.value === ''
        ? []
        : Array.isArray(dataIndex.value)
          ? dataIndex.value
          : [dataIndex.value];

    const value: VueNode = getValue(record.value, path as any);

    // Customize render node
    let returnChildNode = value;
    let returnCellProps: CellType<RecordType> | undefined;

    if (render) {
      const renderData = render(value, record.value, renderIndex.value);

      if (isRenderCell(renderData)) {
        returnChildNode = renderData.children;
        returnCellProps = renderData.props;
        perfRecord.renderWithProps = true;
      } else {
        returnChildNode = renderData;
      }
    }

    return [returnChildNode, returnCellProps];
  });

  return [computed(() => retData.value?.[0]), computed<CellType<RecordType>>(() => retData.value?.[1] as CellType<RecordType>)];
}
