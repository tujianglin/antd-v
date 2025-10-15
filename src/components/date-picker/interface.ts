import type { PickerProps as RcPickerProps, RangePickerProps as RcRangePickerProps } from '@/vc-component/picker';
import type { PanelSemanticName as PopupSemantic, Locale as RcPickerLocale, SemanticName } from '@/vc-component/picker/interface';

import type { CSSProperties } from 'vue';
import type { InputStatus } from '../_util/statusUtils';
import type { AnyObject } from '../_util/type';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import type { TimePickerLocale } from '../time-picker/index.vue';

const _DataPickerPlacements = ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'] as const;

type DataPickerPlacement = (typeof _DataPickerPlacements)[number];

export type PickerLocale = {
  lang: RcPickerLocale & AdditionalPickerLocaleLangProps;
  timePickerLocale: TimePickerLocale;
};

export type AdditionalPickerLocaleLangProps = {
  placeholder: string;
  yearPlaceholder?: string;
  quarterPlaceholder?: string;
  monthPlaceholder?: string;
  weekPlaceholder?: string;
  rangeYearPlaceholder?: [string, string];
  rangeQuarterPlaceholder?: [string, string];
  rangeMonthPlaceholder?: [string, string];
  rangeWeekPlaceholder?: [string, string];
  rangePlaceholder?: [string, string];
};

export type PickerClassNames = Omit<NonNullable<RcPickerProps['classNames']>, 'popup'> & {
  popup?: string | NonNullable<RcPickerProps['classNames']>['popup'];
};

export type RequiredSemanticPicker = readonly [
  classNames: Required<Record<SemanticName, string>> & {
    popup: Required<Record<PopupSemantic, string>>;
  },
  styles: Required<Record<SemanticName, CSSProperties>> & {
    popup: Required<Record<PopupSemantic, CSSProperties>>;
  },
];

type InjectDefaultProps<Props> = Omit<Props, 'locale' | 'generateConfig' | 'hideHeader' | 'classNames'> & {
  locale?: PickerLocale;
  size?: SizeType;
  placement?: DataPickerPlacement;
  status?: InputStatus;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
  rootClassName?: string;
  classNames?: PickerClassNames;
  valueFormat?: string;
};

/** Base Single Picker props */
export type PickerProps<DateType extends AnyObject = any> = InjectDefaultProps<RcPickerProps<DateType>>;

/** Base Range Picker props */
export type RangePickerProps<DateType extends AnyObject = any> = InjectDefaultProps<RcRangePickerProps<DateType>>;

export type GenericTimePickerProps<DateType extends AnyObject = any> = Omit<PickerProps<DateType>, 'picker' | 'showTime'>;

/**
 * Single Picker has the `multiple` prop,
 * which will make the `value` be `DateType[]` type.
 * Here to be a generic which accept the `ValueType` for developer usage.
 */
export type PickerPropsWithMultiple<
  DateType extends AnyObject = any,
  InnerPickerProps extends PickerProps<DateType> = PickerProps<DateType>,
  ValueType = DateType,
> = Omit<InnerPickerProps, 'onChange' | 'onOk'> & {
  onChange?: (date: ValueType, dateString: string | string[]) => void;
  onOk?: (date: ValueType) => void;
};
