import type { PickerProps as RcPickerProps, RangePickerProps as RcRangePickerProps } from '@/vc-component/picker';
import type { PanelSemanticName as PopupSemantic, Locale as RcPickerLocale, SemanticName } from '@/vc-component/picker/interface';

import type { DateType } from '@/vc-util/type';
import type { ComputedRef, CSSProperties } from 'vue';
import type { InputStatus } from '../../_util/statusUtils';
import type { Variant } from '../../config-provider';
import type { SizeType } from '../../config-provider/SizeContext';
import type { TimePickerLocale } from '../../time-picker/index.vue';

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

export type RequiredSemanticPicker = [
  classNames: ComputedRef<
    Required<Record<SemanticName, string>> & {
      popup: Required<Record<PopupSemantic, string>>;
    }
  >,
  styles: ComputedRef<
    Required<Record<SemanticName, CSSProperties>> & {
      popup: Required<Record<PopupSemantic, CSSProperties>>;
    }
  >,
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
export type PickerProps = InjectDefaultProps<RcPickerProps>;

/** Base Range Picker props */
export type RangePickerProps = InjectDefaultProps<RcRangePickerProps>;

export type GenericTimePickerProps = Omit<PickerProps, 'picker' | 'showTime'>;

/**
 * Single Picker has the `multiple` prop,
 * which will make the `value` be `DateType[]` type.
 * Here to be a generic which accept the `ValueType` for developer usage.
 */
export type PickerPropsWithMultiple<InnerPickerProps extends PickerProps = PickerProps> = Omit<
  InnerPickerProps,
  'onChange' | 'onOk'
> & {
  onChange?: (date: DateType | DateType[], dateString: string | string[]) => void;
  onOk?: (date: DateType | DateType[]) => void;
};
