import type { AriaAttributes, CSSProperties } from 'vue';
import type { SizeChangerRender } from './Options.vue';

export interface PaginationLocale {
  // Options
  items_per_page?: string;
  jump_to?: string;
  jump_to_confirm?: string;
  page?: string;

  // Pagination
  prev_page?: string;
  next_page?: string;
  prev_5?: string;
  next_5?: string;
  prev_3?: string;
  next_3?: string;
  page_size?: string;
}

type SemanticName = 'item';

export interface PaginationData {
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  class: string;
  selectPrefixCls: string;
  prefixCls: string;
  pageSizeOptions: number[];

  total: number;
  totalBoundaryShowSizeChanger?: number;

  hideOnSinglePage: boolean;
  align: 'start' | 'center' | 'end';
  showSizeChanger: boolean;
  sizeChangerRender?: SizeChangerRender;
  showLessItems: boolean;
  showPrevNextJumpers: boolean;
  showQuickJumper: boolean | object;
  showTitle: boolean;
  simple: boolean | { readOnly?: boolean };
  disabled: boolean;

  locale: PaginationLocale;

  style: CSSProperties;

  prevIcon: any;
  nextIcon: any;
  jumpPrevIcon: any;
  jumpNextIcon: any;
}

export interface PaginationProps extends Partial<PaginationData>, /** @vue-ignore */ AriaAttributes {
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: any) => any;
  showTotal?: (total: number, range: [number, number]) => any;
  // WAI-ARIA
  role?: string | undefined;
}

export interface PaginationState {
  current: number;
  currentInputValue: number;
  pageSize: number;
}
