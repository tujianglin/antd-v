import type { AnyObject, VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes, Ref, TdHTMLAttributes } from 'vue';
import type { DeepNamePath } from './namePathType';

/**
 * ColumnType which applied in antd: https://ant.design/components/table-cn/#Column
 * - defaultSortOrder
 * - filterDropdown
 * - filterDropdownVisible
 * - filtered
 * - filteredValue
 * - filterIcon
 * - filterMultiple
 * - filters
 * - sorter
 * - sortOrder
 * - sortDirections
 * - onFilter
 * - onFilterDropdownVisibleChange
 */

export const DEFAULT_PREFIX = 'rc-table';

export type Key = VueKey;

/**
 * Use `start` or `end` instead. `left` or `right` is deprecated.
 */
export type FixedType = 'start' | 'end' | 'left' | 'right' | boolean;

export type DefaultRecordType = Record<string, any>;

export type TableLayout = 'auto' | 'fixed';

export type ScrollConfig = {
  /** The index of the row to scroll to */
  index?: number;
  /** The key of the row to scroll to */
  key?: Key;
  /** The absolute scroll position from top */
  top?: number;
  /**
   * Additional offset in pixels to apply to the scroll position.
   * Only effective when using `key` or `index` mode.
   * Ignored when using `top` mode.
   * When offset is set, the target element will always be aligned to the top of the container.
   */
  offset?: number;
};

export type Reference = {
  nativeElement: HTMLDivElement;
  scrollTo: (config: ScrollConfig) => void;
};

// ==================== Row =====================
export type RowClassName<RecordType> = (record: RecordType, index: number, indent: number) => string;

// =================== Column ===================
export interface CellType<RecordType> {
  key?: Key;
  class?: string;
  style?: CSSProperties;
  children?: VueNode;
  column?: ColumnsType<RecordType>[number];
  colspan?: number;
  rowspan?: number;

  /** Only used for table header */
  hasSubColumns?: boolean;
  colStart?: number;
  colEnd?: number;
}

export interface RenderedCell<RecordType> {
  props?: CellType<RecordType>;
  children?: VueNode;
}

export type Direction = 'ltr' | 'rtl';

// SpecialString will be removed in antd@6
export type SpecialString<T> = T | (string & NonNullable<unknown>);

export type DataIndex<T = any> = DeepNamePath<T> | SpecialString<T> | number | (SpecialString<T> | number)[];

export type CellEllipsisType = { showTitle?: boolean } | boolean;

export type ColScopeType = 'col' | 'colgroup';

export type RowScopeType = 'row' | 'rowgroup';

export type ScopeType = ColScopeType | RowScopeType;

interface ColumnSharedType<RecordType> {
  title?: VueNode;
  key?: Key;
  class?: string;
  hidden?: boolean;
  fixed?: FixedType;
  onHeaderCell?: GetComponentProps<ColumnsType<RecordType>[number]>;
  ellipsis?: CellEllipsisType;
  align?: AlignType;
  rowScope?: RowScopeType;
}

export interface ColumnGroupType<RecordType extends AnyObject> extends ColumnSharedType<RecordType> {
  children: ColumnsType<RecordType>;
}

export type AlignType = 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';

export interface ColumnType<RecordType> extends ColumnSharedType<RecordType> {
  colspan?: number;
  dataIndex?: DataIndex<RecordType>;
  render?: (value: any, record: RecordType, index: number) => VueNode | RenderedCell<RecordType>;
  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean;
  rowspan?: number;
  width?: number | string;
  minWidth?: number;
  onCell?: GetComponentProps<RecordType>;
}

export type ColumnsType<RecordType = unknown> = (ColumnGroupType<RecordType> | ColumnType<RecordType>)[];

export type GetRowKey<RecordType extends AnyObject = AnyObject> = (record: RecordType, index?: number) => Key;

// ================= Fix Column =================
export interface StickyOffsets {
  start: number[];
  end: number[];
  widths: number[];
  isSticky?: boolean;
}

// ================= Customized =================
export type GetComponentProps<DataType> = (data: DataType, index?: number) => HTMLAttributes & TdHTMLAttributes;

type Component = any;

export type CustomizeComponent = Component;

export type OnCustomizeScroll = (info: { currentTarget?: HTMLElement; scrollLeft?: number }) => void;

export type CustomizeScrollBody<RecordType> = (
  data: RecordType[],
  info: {
    scrollbarSize: number;
    ref: Ref<{ scrollLeft: number; scrollTo?: (scrollConfig: ScrollConfig) => void }>;
    onScroll: OnCustomizeScroll;
  },
) => VueNode;

export interface TableComponents<RecordType> {
  table?: CustomizeComponent;
  header?: {
    table?: CustomizeComponent;
    wrapper?: CustomizeComponent;
    row?: CustomizeComponent;
    cell?: CustomizeComponent;
  };
  body?:
    | CustomizeScrollBody<RecordType>
    | {
        wrapper?: CustomizeComponent;
        row?: CustomizeComponent;
        cell?: CustomizeComponent;
      };
}

export type GetComponent = (path: string[], defaultComponent?: CustomizeComponent) => CustomizeComponent;

// =================== Expand ===================
export type ExpandableType = false | 'row' | 'nest';

export interface LegacyExpandableProps<RecordType> {
  title?: PanelRender<RecordType>;
}

export type ExpandedRowRender<ValueType> = (record: ValueType, index: number, indent: number, expanded: boolean) => VueNode;

export interface RenderExpandIconProps<RecordType> {
  prefixCls: string;
  expanded: boolean;
  record: RecordType;
  expandable: boolean;
  onExpand: TriggerEventHandler<RecordType>;
}

export type RenderExpandIcon<RecordType> = (props: RenderExpandIconProps<RecordType>) => VueNode;

export interface ExpandableConfig<RecordType> {
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  expandedRowRender?: ExpandedRowRender<RecordType>;
  columnTitle?: VueNode;
  expandRowByClick?: boolean;
  expandIcon?: RenderExpandIcon<RecordType>;
  onExpand?: (expanded: boolean, record: RecordType) => void;
  onExpandedRowsChange?: (expandedKeys: Key[]) => void;
  defaultExpandAllRows?: boolean;
  indentSize?: number;
  showExpandColumn?: boolean;
  expandedRowClassName?: string | RowClassName<RecordType>;
  childrenColumnName?: string;
  rowExpandable?: (record: RecordType) => boolean;
  columnWidth?: number | string;
  fixed?: FixedType;
  expandedRowOffset?: number;
}

// =================== Render ===================
export type PanelRender<RecordType> = (data: RecordType[]) => VueNode;

// =================== Events ===================
export type TriggerEventHandler<RecordType> = (record: RecordType, event: MouseEvent) => void;

// =================== Sticky ===================
export interface TableSticky {
  offsetHeader?: number;
  offsetSummary?: number;
  offsetScroll?: number;
  getContainer?: () => Window | HTMLElement;
}
