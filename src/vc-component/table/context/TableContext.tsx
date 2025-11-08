// TableContext.ts
import { computed, defineComponent, inject, provide, type ComputedRef, type InjectionKey, type PropType } from 'vue';
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
  scrollX: number | string | true;
  classNames?: TableProps['classNames'];
  styles?: TableProps['styles'];

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

  rowClassName: string | RowClassName<RecordType>;
  expandedRowClassName: string | RowClassName<RecordType>;
  onRow?: GetComponentProps<RecordType>;
  emptyNode?: any;

  tableLayout: TableLayout;

  indentSize: number;
  expandableType: ExpandableType;
  expandRowByClick: boolean;
  expandedRowRender: ExpandedRowRender<RecordType>;
  expandIcon: RenderExpandIcon<RecordType>;
  onTriggerExpand: TriggerEventHandler<RecordType>;
  allColumnsFixedLeft: boolean;

  columns: ColumnsType<RecordType>;
  flattenColumns: ColumnType<RecordType>[];
  onColumnResize: (columnKey: any, width: number) => void;
  colWidths: number[];

  hoverStartRow: number;
  hoverEndRow: number;
  onHover: (start: number, end: number) => void;
  rowExpandable: (record: RecordType) => boolean;

  expandedKeys: Set<any>;
  getRowKey: GetRowKey<RecordType>;
  childrenColumnName: string;

  rowHoverable?: boolean;
  expandedRowOffset: ExpandableConfig<RecordType>['expandedRowOffset'];
  measureRowRender?: (measureRow: any) => any;
}

// TableContext 类型，每个属性是 ComputedRef
export type TableContextType = {
  [K in keyof TableContextProps]: ComputedRef<TableContextProps[K]>;
};

// InjectionKey
const TableContext: InjectionKey<TableContextType> = Symbol('TableContext');

// Inject hook
export const useTableContextInject = (): Partial<TableContextType> => {
  return inject(TableContext, null) as Partial<TableContextType>;
};

// Provider helper
export const useTableContextProvider = (props: ComputedRef<TableContextProps>) => {
  const state = {};

  // 每个属性独立 computed
  (Object.keys(props.value) as Array<keyof TableContextProps>).forEach((key) => {
    state[key] = computed(() => props.value[key]);
  });

  provide(TableContext, state as TableContextType);
};

// TableContextProvider 组件
export const TableContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<TableContextProps>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useTableContextProvider(computed(() => props.value as TableContextProps));
    return () => <>{slots.default?.()}</>;
  },
});
