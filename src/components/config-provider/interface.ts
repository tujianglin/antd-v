import type { WarningContextProps } from '../_util/warning';
import type { Locale } from '../locale';
import type {
  AlertConfig,
  BadgeConfig,
  ButtonConfig,
  CardConfig,
  CascaderConfig,
  CheckboxConfig,
  ComponentStyleConfig,
  ConfigConsumerProps,
  CSPConfig,
  DatePickerConfig,
  DirectionType,
  EmptyConfig,
  FlexConfig,
  FloatButtonConfig,
  FloatButtonGroupConfig,
  ImageConfig,
  InputConfig,
  InputNumberConfig,
  InputSearchConfig,
  MentionsConfig,
  MenuConfig,
  MessageConfig,
  NotificationConfig,
  OTPConfig,
  PaginationConfig,
  PopconfirmConfig,
  PopoverConfig,
  PopupOverflow,
  RadioConfig,
  RangePickerConfig,
  SelectConfig,
  SpaceConfig,
  TabsConfig,
  TagConfig,
  TextAreaConfig,
  ThemeConfig,
  TimePickerConfig,
  TooltipConfig,
  TransferConfig,
  TreeSelectConfig,
  Variant,
  WaveConfig,
} from './context';
import type { RenderEmptyHandler } from './defaultRenderEmpty.vue';
import type { SizeType } from './SizeContext';

export const configConsumerProps = [
  'getTargetContainer',
  'getPopupContainer',
  'rootPrefixCls',
  'getPrefixCls',
  'renderEmpty',
  'csp',
  'autoInsertSpaceInButton',
  'locale',
];

// These props is used by `useContext` directly in sub component
export const PASSED_PROPS: Exclude<keyof ConfigConsumerProps, 'rootPrefixCls' | 'getPrefixCls' | 'warning'>[] = [
  'getTargetContainer',
  'getPopupContainer',
  'renderEmpty',
  'input',
  'pagination',
  // 'form',
  'select',
  'button',
];

export interface ConfigProviderProps {
  getTargetContainer?: () => HTMLElement | Window;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  prefixCls?: string;
  iconPrefixCls?: string;
  renderEmpty?: RenderEmptyHandler;
  csp?: CSPConfig;
  variant?: Variant;
  // form?: FormConfig;
  input?: InputConfig;
  inputSearch?: InputSearchConfig;
  otp?: OTPConfig;
  inputNumber?: InputNumberConfig;
  textArea?: TextAreaConfig;
  select?: SelectConfig;
  pagination?: PaginationConfig;
  /**
   * @descCN 语言包配置，语言包可到 `antd/locale` 目录下寻找。
   * @descEN Language package setting, you can find the packages in `antd/locale`.
   */
  locale?: Locale;
  componentSize?: SizeType;
  componentDisabled?: boolean;
  /**
   * @descCN 设置布局展示方向。
   * @descEN Set direction of layout.
   * @default ltr
   */
  direction?: DirectionType;
  space?: SpaceConfig;
  splitter?: ComponentStyleConfig;
  /**
   * @descCN 设置 `false` 时关闭虚拟滚动。
   * @descEN Close the virtual scrolling when setting `false`.
   * @default true
   */
  virtual?: boolean;
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  theme?: ThemeConfig;
  warning?: WarningContextProps;
  alert?: AlertConfig;
  affix?: ComponentStyleConfig;
  anchor?: ComponentStyleConfig;
  button?: ButtonConfig;
  calendar?: ComponentStyleConfig;
  carousel?: ComponentStyleConfig;
  cascader?: CascaderConfig;
  treeSelect?: TreeSelectConfig;
  // collapse?: CollapseConfig;
  divider?: ComponentStyleConfig;
  // drawer?: DrawerConfig;
  typography?: ComponentStyleConfig;
  // skeleton?: SkeletonConfig;
  // spin?: SpinConfig;
  segmented?: ComponentStyleConfig;
  statistic?: ComponentStyleConfig;
  steps?: ComponentStyleConfig;
  image?: ImageConfig;
  layout?: ComponentStyleConfig;
  mentions?: MentionsConfig;
  // modal?: ModalConfig;
  progress?: ComponentStyleConfig;
  result?: ComponentStyleConfig;
  slider?: ComponentStyleConfig;
  breadcrumb?: ComponentStyleConfig;
  // masonry?: MasonryConfig;
  menu?: MenuConfig;
  floatButton?: FloatButtonConfig;
  floatButtonGroup?: FloatButtonGroupConfig;
  checkbox?: CheckboxConfig;
  descriptions?: ComponentStyleConfig;
  empty?: EmptyConfig;
  badge?: BadgeConfig;
  radio?: RadioConfig;
  rate?: ComponentStyleConfig;
  // ribbon?: RibbonConfig;
  switch?: ComponentStyleConfig;
  transfer?: TransferConfig;
  avatar?: ComponentStyleConfig;
  message?: MessageConfig;
  tag?: TagConfig;
  // table?: TableConfig;
  card?: CardConfig;
  // cardMeta?: CardMetaConfig;
  tabs?: TabsConfig;
  timeline?: ComponentStyleConfig;
  timePicker?: TimePickerConfig;
  upload?: ComponentStyleConfig;
  notification?: NotificationConfig;
  tree?: ComponentStyleConfig;
  colorPicker?: ComponentStyleConfig;
  datePicker?: DatePickerConfig;
  rangePicker?: RangePickerConfig;
  dropdown?: ComponentStyleConfig;
  flex?: FlexConfig;
  /**
   * Wave is special component which only patch on the effect of component interaction.
   */
  wave?: WaveConfig;
  // tour?: TourConfig;
  tooltip?: TooltipConfig;
  popover?: PopoverConfig;
  popconfirm?: PopconfirmConfig;
  watermark?: ComponentStyleConfig;
  // qrcode?: QRcodeConfig;
}

export interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  legacyLocale: Locale;
}
