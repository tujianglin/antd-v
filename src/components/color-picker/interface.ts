import type { ColorGenInput, ColorPickerProps as RcColorPickerProps } from '@/vc-component/color-picker';
import type { VueKey } from '@/vc-util/type';
import type { CSSProperties } from 'vue';
import type { SizeType } from '../config-provider/SizeContext';
import type { PopoverProps } from '../popover/index.vue';
import type { TooltipPlacement } from '../tooltip/index.vue';
import type { AggregationColor } from './color';

export type { ColorGenInput };

export type Colors<T> = {
  color: ColorGenInput<T>;
  percent: number;
}[];

export const FORMAT_HEX = 'hex';
export const FORMAT_RGB = 'rgb';
export const FORMAT_HSB = 'hsb';

export type ColorFormatType = typeof FORMAT_HEX | typeof FORMAT_RGB | typeof FORMAT_HSB;

export interface PresetsItem {
  label: any;
  colors: (string | AggregationColor | LineGradientType)[];
  /**
   * Whether the initial state is collapsed
   * @since 5.11.0
   * @default true
   */
  defaultOpen?: boolean;
  /**
   * The key of the panel
   * @since 5.23.0
   */
  key?: VueKey;
}

export type TriggerType = 'click' | 'hover';

export type TriggerPlacement = TooltipPlacement; // Alias, to prevent breaking changes.

export type SingleValueType = AggregationColor | string;

export type LineGradientType = {
  color: SingleValueType;
  percent: number;
}[];

export type ColorValueType = SingleValueType | null | LineGradientType;

export type ModeType = 'single' | 'gradient';

type SemanticName = 'root';
type PopupSemantic = 'root';
export type ColorPickerProps = Omit<
  RcColorPickerProps,
  'onChange' | 'value' | 'defaultValue' | 'panelRender' | 'disabledAlpha' | 'onChangeComplete' | 'components'
> & {
  mode?: ModeType | ModeType[];
  disabled?: boolean;
  placement?: TriggerPlacement;
  trigger?: TriggerType;
  allowClear?: boolean;
  presets?: PresetsItem[];
  arrow?: boolean | { pointAtCenter: boolean };
  panelRender?: (panel: any, extra: { components: { Picker: any; Presets: any } }) => any;
  showText?: boolean | ((color: AggregationColor) => any);
  size?: SizeType;
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
    popupOverlayInner?: CSSProperties;
  };
  rootClassName?: string;
  disabledAlpha?: boolean;
  [key: `data-${string}`]: string;
  onOpenChange?: (open: boolean) => void;
  onFormatChange?: (format?: ColorFormatType) => void;
  onChange?: (value: AggregationColor, css: string) => void;
  onClear?: () => void;
  onChangeComplete?: (value: AggregationColor) => void;
  disabledFormat?: boolean;
} & Pick<PopoverProps, 'getPopupContainer' | 'autoAdjustOverflow' | 'destroyOnHidden'>;
