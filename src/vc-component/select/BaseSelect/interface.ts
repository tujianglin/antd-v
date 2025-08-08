import type { RenderNode } from '@/components/_util/type';
import type { AlignType, BuildInPlacements } from '@/vc-component/trigger/interface';
import type { ScrollConfig, ScrollTo } from '@/vc-component/virtual-list/interface';
import type { AriaAttributes, CSSProperties } from 'vue';
import type { DisplayInfoType, DisplayValueType, Mode, Placement, RenderDOMFunc } from '../interface';

export type BaseSelectSemanticName = 'prefix' | 'suffix' | 'input';

export const DEFAULT_OMIT_PROPS = [
  'value',
  'onChange',
  'removeIcon',
  'placeholder',
  'autoFocus',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
  'onPopupScroll',
  'tabIndex',
] as const;
export interface RefOptionListProps {
  onKeydown: (e: KeyboardEvent) => void;
  onKeyup: (e: KeyboardEvent) => void;
  scrollTo?: (args: number | ScrollConfig) => void;
}

export type CustomTagProps = {
  label: RenderNode;
  value: any;
  disabled: boolean;
  onClose: (event?: MouseEvent) => void;
  closable: boolean;
  isMaxTag: boolean;
  index: number;
};

export interface BaseSelectRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  scrollTo: ScrollTo;
  nativeElement: HTMLElement;
}

export interface BaseSelectPrivateProps {
  // >>> MISC
  id: string;
  prefixCls: string;
  omitDomProps?: string[];

  // >>> Value
  displayValues: DisplayValueType[];
  onDisplayValuesChange: (
    values: DisplayValueType[],
    info: {
      type: DisplayInfoType;
      values: DisplayValueType[];
    },
  ) => void;

  // >>> Active
  /** Current dropdown list active item string value */
  activeValue?: string;
  /** Link search input with target element */
  activeDescendantId?: string;
  onActiveValueChange?: (value: string | null) => void;

  // >>> Search
  searchValue: string;
  autoClearSearchValue?: boolean;
  /** Trigger onSearch, return false to prevent trigger open event */
  onSearch: (
    searchValue: string,
    info: {
      source:
        | 'typing' //User typing
        | 'effect' // Code logic trigger
        | 'submit' // tag mode only
        | 'blur'; // Not trigger event
    },
  ) => void;
  /** Trigger when search text match the `tokenSeparators`. Will provide split content */
  onSearchSplit?: (words: string[]) => void;

  // >>> Dropdown
  OptionList: any;
  /** Tell if provided `options` is empty */
  emptyOptions: boolean;
}

interface CommonSelectProps {
  // Style
  class?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<BaseSelectSemanticName, string>>;
  styles?: Partial<Record<BaseSelectSemanticName, CSSProperties>>;

  // Selector
  showSearch?: boolean;
  tagRender?: (props: CustomTagProps) => RenderNode;
  direction?: 'ltr' | 'rtl';
  autofocus?: boolean;
  placeholder?: RenderNode;
  maxCount?: number;

  // MISC
  title?: string;
  tabindex?: number;
  notFoundContent?: RenderNode;
  onClear?: () => void;
  maxlength?: number;
  showScrollBar?: boolean | 'optional';

  choiceTransitionName?: string;

  // >>> Mode
  mode?: Mode;

  // >>> Status
  disabled?: boolean;
  loading?: boolean;

  // >>> Open
  onPopupVisibleChange?: (open: boolean) => void;

  // >>> Customize Input
  /** @private Internal usage. Do not use in your production. */
  getInputElement?: () => RenderNode;
  /** @private Internal usage. Do not use in your production. */
  getRawInputElement?: () => RenderNode;

  // >>> Selector
  maxTagTextLength?: number;
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?: RenderNode | ((omittedValues: DisplayValueType[]) => RenderNode);

  // >>> Search
  tokenSeparators?: string[];

  // >>> Icons
  allowClear?: boolean | { clearIcon?: RenderNode };
  prefix?: RenderNode;
  suffixIcon?: RenderNode;
  /** Selector remove icon */
  removeIcon?: RenderNode;

  // >>> Dropdown/Popup
  animation?: string;
  transitionName?: string;

  popupStyle?: CSSProperties;
  popupClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: RenderNode) => RenderNode;
  popupAlign?: AlignType;

  placement?: Placement;
  builtinPlacements?: BuildInPlacements;
  getPopupContainer?: RenderDOMFunc;

  // >>> Focus
  showAction?: ('focus' | 'click')[];
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;

  // >>> Rest Events
  onKeyup?: (e: KeyboardEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onMousedown?: (e: MouseEvent) => void;
  onPopupScroll?: (e: UIEvent) => void;
  onInputKeyDown?: (e: KeyboardEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
}

export type BaseSelectPropsWithoutPrivate = CommonSelectProps;

export interface BaseSelectProps extends BaseSelectPrivateProps, CommonSelectProps, /** @vue-ignore */ AriaAttributes {}

export const isMultiple = (mode: Mode) => mode === 'tags' || mode === 'multiple';
