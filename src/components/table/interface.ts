import type {
  ExpandableConfig,
  FixedType,
  GetComponentProps,
  GetRowKey,
  ColumnType as RcColumnType,
  RenderedCell as RcRenderedCell,
} from '@/vc-component/table/interface';
import type { VueKey, VueNode } from '@/vc-util/type';
import type { AriaAttributes, ComponentInstance } from 'vue';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { AnyObject } from '../_util/type';
import type { CheckboxProps } from '../checkbox';
import type Dropdown from '../dropdown';
import type Pagination from '../pagination';
import type { TooltipProps } from '../tooltip';
import type { INTERNAL_SELECTION_ITEM } from './hooks/useSelection';

export type TablePaginationPlacement =
  | 'topStart'
  | 'topCenter'
  | 'topEnd'
  | 'bottomStart'
  | 'bottomCenter'
  | 'bottomEnd'
  | 'none';

export type TablePaginationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'
  | 'none';

export type RefTable = (props: any) => VueNode;

export type RefInternalTable = (props: any) => VueNode;

export type { ExpandableConfig, GetRowKey };

export type Key = VueKey;

export type SafeKey = Exclude<Key, bigint>;

export type RowSelectionType = 'checkbox' | 'radio';

export type SelectionItemSelectFn = (currentRowKeys: Key[]) => void;

export type ExpandType = null | 'row' | 'nest';

export interface TableLocale {
  filterTitle?: string;
  filterConfirm?: VueNode;
  filterReset?: VueNode;
  filterEmptyText?: VueNode;
  filterCheckAll?: VueNode;
  filterSearchPlaceholder?: string;
  emptyText?: VueNode | (() => VueNode);
  selectAll?: VueNode;
  selectNone?: VueNode;
  selectInvert?: VueNode;
  selectionAll?: VueNode;
  sortTitle?: string;
  expand?: string;
  collapse?: string;
  triggerDesc?: string;
  triggerAsc?: string;
  cancelSort?: string;
}

export type SortOrder = 'descend' | 'ascend' | null;

export type SorterTooltipTarget = 'full-header' | 'sorter-icon';

export type SorterTooltipProps = TooltipProps & {
  target?: SorterTooltipTarget;
};

const _TableActions = ['paginate', 'sort', 'filter'] as const;
export type TableAction = (typeof _TableActions)[number];

export type CompareFn<T = AnyObject> = (a: T, b: T, sortOrder?: SortOrder) => number;

export interface ColumnFilterItem {
  text: VueNode;
  value: VueKey | boolean;
  children?: ColumnFilterItem[];
}

export interface ColumnTitleProps<RecordType = AnyObject> {
  sortColumns?: { column: ColumnType<RecordType>; order: SortOrder }[];

  filters?: Record<string, FilterValue>;
}

export type ColumnTitle<RecordType = AnyObject> = VueNode | ((props: ColumnTitleProps<RecordType>) => VueNode);

export type FilterValue = (Key | boolean)[];
export type FilterKey = (string | number)[] | null;
export type FilterSearchType<RecordType = AnyObject> = boolean | ((input: string, record: RecordType) => boolean);
export interface FilterConfirmProps {
  closeDropdown: boolean;
}

export interface FilterRestProps {
  confirm?: boolean;
  closeDropdown?: boolean;
}

export interface FilterDropdownProps {
  prefixCls: string;
  setSelectedKeys: (selectedKeys: VueKey[]) => void;
  selectedKeys: VueKey[];
  /**
   * Confirm filter value, if you want to close dropdown before commit, you can call with
   * {closeDropdown: true}
   */
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters?: (param?: FilterRestProps) => void;
  filters?: ColumnFilterItem[];
  /** Only close filterDropdown */
  close: () => void;
  visible: boolean;
}

type DropdownProps = Partial<ComponentInstance<typeof Dropdown>['$props']>;
// 非必要请勿导出
interface CoverableDropdownProps extends Omit<DropdownProps, 'onOpenChange'> {
  onOpenChange?: (open: boolean) => void;
}

export interface ColumnType<RecordType = AnyObject> extends Omit<RcColumnType<RecordType>, 'title'> {
  title?: ColumnTitle<RecordType>;
  // Sorter
  sorter?:
    | boolean
    | CompareFn<RecordType>
    | {
        compare?: CompareFn<RecordType>;
        /** Config multiple sorter order priority */
        multiple?: number;
      };
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  sortDirections?: SortOrder[];
  sortIcon?: (props: { sortOrder: SortOrder }) => VueNode;
  showSorterTooltip?: boolean | SorterTooltipProps;

  // Filter
  filtered?: boolean;
  filters?: ColumnFilterItem[];
  filterDropdown?: VueNode | ((props: FilterDropdownProps) => VueNode);
  filterOnClose?: boolean;
  filterMultiple?: boolean;
  filteredValue?: FilterValue | null;
  defaultFilteredValue?: FilterValue | null;
  filterIcon?: VueNode | ((filtered: boolean) => VueNode);
  filterMode?: 'menu' | 'tree';
  filterSearch?: FilterSearchType<ColumnFilterItem>;
  onFilter?: (value: VueKey | boolean, record: RecordType) => boolean;
  /**
   * Can cover `<Dropdown>` props
   * @since 5.22.0
   */
  filterDropdownProps?: CoverableDropdownProps;
  filterResetToDefaultFilteredValue?: boolean;

  // Responsive
  responsive?: Breakpoint[];
}

export interface ColumnGroupType<RecordType = AnyObject> extends Omit<ColumnType<RecordType>, 'dataIndex'> {
  children: ColumnsType<RecordType>;
}

export type ColumnsType<RecordType = AnyObject> = (ColumnGroupType<RecordType> | ColumnType<RecordType>)[];

export interface SelectionItem {
  key: string;
  text: VueNode;
  onSelect?: SelectionItemSelectFn;
}

export type SelectionSelectFn<T = AnyObject> = (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;

export type RowSelectMethod = 'all' | 'none' | 'invert' | 'single' | 'multiple';

export interface TableRowSelection<T = AnyObject> {
  /** Keep the selection keys in list even the key not exist in `dataSource` anymore */
  preserveSelectedRowKeys?: boolean;
  type?: RowSelectionType;
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  onChange?: (selectedRowKeys: Key[], selectedRows: T[], info: { type: RowSelectMethod }) => void;
  getCheckboxProps?: (record: T) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>;
  onSelect?: SelectionSelectFn<T>;
  selections?: INTERNAL_SELECTION_ITEM[] | boolean;
  hideSelectAll?: boolean;
  fixed?: FixedType;
  columnWidth?: string | number;
  columnTitle?: VueNode | ((checkboxNode: VueNode) => VueNode);
  checkStrictly?: boolean;
  /** Set the alignment of the selection column */
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: boolean, record: T, index: number, originNode: VueNode) => VueNode | RcRenderedCell<T>;
  onCell?: GetComponentProps<T>;
  getTitleCheckboxProps?: () => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>> & AriaAttributes;
}

export type TransformColumns<RecordType = AnyObject> = (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>;

export interface TableCurrentDataSource<RecordType = AnyObject> {
  currentDataSource: RecordType[];
  action: TableAction;
}

export interface SorterResult<RecordType = AnyObject> {
  column?: ColumnType<RecordType>;
  order?: SortOrder;
  field?: Key | readonly Key[];
  columnKey?: Key;
}

export type GetPopupContainer = (triggerNode: HTMLElement) => HTMLElement;

type PaginationProps = Partial<ComponentInstance<typeof Pagination>['$props']>;

export interface TablePaginationConfig extends PaginationProps {
  position?: TablePaginationPosition[];
}
