import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { BaseSelectPropsWithoutPrivate, BaseSelectSemanticName } from './BaseSelect/interface';

export type RawValueType = string | number;
export interface FlattenOptionData<OptionType> {
  label?: VueNode;
  data: OptionType;
  key: VueKey;
  value?: RawValueType;
  groupOption?: boolean;
  group?: boolean;
}

export interface DisplayValueType {
  key?: VueKey;
  value?: RawValueType;
  label?: VueNode;
  title?: VueNode;
  disabled?: boolean;
  index?: number;
}

export type RenderDOMFunc = (props: any) => HTMLElement;

export type Mode = 'multiple' | 'tags' | 'combobox' | undefined;

export type Placement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export type DisplayInfoType = 'add' | 'remove' | 'clear';

export type OnActiveValue = (active: RawValueType, index: number, info?: { source?: 'keyboard' | 'mouse' }) => void;

export type OnInternalSelect = (value: RawValueType, info: { selected: boolean }) => void;

export interface LabelInValueType {
  label: VueNode;
  value: RawValueType;
}

export type DraftValueType =
  | RawValueType
  | LabelInValueType
  | DisplayValueType
  | (RawValueType | LabelInValueType | DisplayValueType)[];

export type FilterFunc<OptionType> = (inputValue: string, option?: OptionType) => boolean;

export interface FieldNames {
  value?: string;
  label?: string;
  groupLabel?: string;
  options?: string;
}

export interface BaseOptionType {
  disabled?: boolean;
  className?: string;
  title?: string;
  [name: string]: any;
}

export interface DefaultOptionType extends BaseOptionType {
  label?: VueNode;
  value?: string | number | null;
  children?: Omit<DefaultOptionType, 'children'>[];
}

export type SelectHandler<ValueType, OptionType extends BaseOptionType = DefaultOptionType> = (
  value: ValueType,
  option: OptionType,
) => void;

type ArrayElementType<T> = T extends (infer E)[] ? E : T;

export type SemanticName = BaseSelectSemanticName;
export type PopupSemantic = 'listItem' | 'list';
export interface SearchConfig<OptionType> {
  searchValue?: string;
  autoClearSearchValue?: boolean;
  onSearch?: (value: string) => void;
  filterOption?: boolean | FilterFunc<OptionType>;
  filterSort?: (optionA: OptionType, optionB: OptionType, info: { searchValue: string }) => number;
  optionFilterProp?: string;
}
export interface SelectProps<ValueType = any, OptionType extends BaseOptionType = DefaultOptionType>
  extends Omit<BaseSelectPropsWithoutPrivate, 'showSearch'> {
  prefixCls?: string;
  id?: string;

  backfill?: boolean;

  // >>> Field Names
  fieldNames?: FieldNames;
  showSearch?: boolean | SearchConfig<OptionType>;

  // >>> Select
  onSelect?: SelectHandler<ArrayElementType<ValueType>, OptionType>;
  onDeselect?: SelectHandler<ArrayElementType<ValueType>, OptionType>;
  onActive?: (value: ValueType) => void;

  // >>> Options
  /**
   * In Select, `false` means do nothing.
   * In TreeSelect, `false` will highlight match item.
   * It's by design.
   */
  optionLabelProp?: string;

  options?: OptionType[];
  optionRender?: (oriOption: FlattenOptionData<OptionType>, info: { index: number }) => VueNode;
  defaultActiveFirstOption?: boolean;
  virtual?: boolean;
  direction?: 'ltr' | 'rtl';
  listHeight?: number;
  listItemHeight?: number;
  labelRender?: (props: LabelInValueType) => VueNode;

  // >>> Icon
  menuItemSelectedIcon?: VueNode;

  mode?: 'combobox' | 'multiple' | 'tags';
  labelInValue?: boolean;
  maxCount?: number;
  onChange?: (value: ValueType, option?: OptionType | OptionType[]) => void;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}
