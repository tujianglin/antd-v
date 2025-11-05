import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type {
  ColumnsType,
  ColumnType,
  Direction,
  ExpandableConfig,
  ExpandableType,
  ExpandedRowRender,
  GetComponent,
  GetComponentProps,
  GetRowKey,
  RenderExpandIcon,
  RowClassName,
  TableLayout,
  TriggerEventHandler,
} from '../interface';
import type { TableProps } from '../Table.vue';
import type { FixedInfo } from '../utils/fixUtil';
export type ScrollInfoType = [scrollLeft: number, scrollRange: number];

export interface TableContextProps<RecordType = any> {
  // Scroll
  scrollX: number | string | true;
  classNames?: TableProps['classNames'];
  styles?: TableProps['styles'];

  // Table
  prefixCls: string;
  getComponent: GetComponent;
  scrollbarSize: number;
  direction: Direction;
  fixedInfoList: FixedInfo[];
  isSticky: boolean;
  componentWidth: number;
  fixHeader: boolean | undefined;
  fixColumn: boolean;
  horizonScroll: boolean;
  scrollInfo: ScrollInfoType;

  // Body
  rowClassName: string | RowClassName<RecordType>;
  expandedRowClassName: string | RowClassName<RecordType>;
  onRow?: GetComponentProps<RecordType>;
  emptyNode?: any; // VNodeChild

  tableLayout: TableLayout;

  indentSize: number;
  expandableType: ExpandableType;
  expandRowByClick: boolean;
  expandedRowRender: ExpandedRowRender<RecordType>;
  expandIcon: RenderExpandIcon<RecordType>;
  onTriggerExpand: TriggerEventHandler<RecordType>;
  allColumnsFixedLeft: boolean;

  // Column
  columns: ColumnsType<RecordType>;
  flattenColumns: ColumnType<RecordType>[];
  onColumnResize: (columnKey: any, width: number) => void;
  colWidths: number[];

  // Row
  hoverStartRow: number;
  hoverEndRow: number;
  onHover: (start: number, end: number) => void;
  rowExpandable: (record: RecordType) => boolean;

  expandedKeys: Set<any>;
  getRowKey: GetRowKey<RecordType>;
  childrenColumnName: string;

  rowHoverable?: boolean;

  expandedRowOffset: ExpandableConfig<RecordType>['expandedRowOffset'];

  // Measure Row
  measureRowRender?: (measureRow: any) => any;
}

export type SizeType = 'small' | 'middle' | 'large' | undefined;

const TableContext: InjectionKey<Reactive<TableContextProps>> = Symbol('TableContext');

export const useTableContextInject = (): Reactive<Partial<TableContextProps>> => {
  return inject(TableContext, reactive<Partial<TableContextProps>>({}));
};

export const useTableContextProvider = (props: Reactive<TableContextProps>) => {
  provide(TableContext, props);
};

export const TableContextProvider = defineComponent({
  props: {
    value: Object as PropType<TableContextProps>,
  },
  setup(props, { slots }) {
    useTableContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
