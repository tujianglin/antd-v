import type { ScrollTo } from '@/vc-component/virtual-list/interface';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { CustomTagProps } from '../BaseSelect/interface';
import type { DisplayValueType, Mode } from '../interface';

export interface InnerSelectorProps {
  prefixCls: string;
  id: string;
  mode: Mode;
  title?: string;

  placeholder?: VueNode;
  disabled?: boolean;
  autofocus?: boolean;
  autocomplete?: string;
  values: DisplayValueType[];
  showSearch?: boolean;
  searchValue: string;
  autoClearSearchValue?: boolean;
  activeDescendantId?: string;
  open: boolean;
  tabindex?: number;
  maxlength?: number;

  onInputKeyDown: (e: KeyboardEvent) => void;
  onInputMouseDown: (e: MouseEvent) => void;
  onInputChange: (e) => void;
  onInputPaste: (e: ClipboardEvent) => void;
  onInputCompositionStart: (e: CompositionEvent) => void;
  onInputCompositionEnd: (e: CompositionEvent) => void;
  onInputBlur: (e: FocusEvent) => void;
}

export interface RefSelectorProps {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  scrollTo?: ScrollTo;
  nativeElement: HTMLDivElement;
}

export interface SelectorProps {
  prefixClassName: string;
  prefixStyle: CSSProperties;
  id: string;
  prefixCls: string;
  showSearch?: boolean;
  open: boolean;
  /** Display in the Selector value, it's not same as `value` prop */
  values: DisplayValueType[];
  mode: Mode;
  searchValue: string;
  activeValue: string;
  autoClearSearchValue: boolean;
  inputElement: VueNode;
  maxLength?: number;

  autofocus?: boolean;
  activeDescendantId?: string;
  tabindex?: number;
  disabled?: boolean;
  placeholder?: VueNode;
  removeIcon?: VueNode;
  prefix?: VueNode;

  // Tags
  maxTagCount?: number | 'responsive';
  maxTagTextLength?: number;
  maxTagPlaceholder?: VueNode | ((omittedValues: DisplayValueType[]) => VueNode);
  tagRender?: (props: CustomTagProps) => VueNode;

  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter?: boolean;

  // Motion
  choiceTransitionName?: string;

  onToggleOpen: (open?: boolean) => void;
  /** `onSearch` returns go next step boolean to check if need do toggle open */
  onSearch: (searchText: string, fromTyping: boolean, isCompositing: boolean) => boolean;
  onSearchSubmit?: (searchText: string) => void;
  onRemove: (value: DisplayValueType) => void;
  onInputKeyDown?: (e: KeyboardEvent) => void;
  // on inner input blur
  onInputBlur?: () => void;
}
