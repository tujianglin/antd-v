import type { PaginationLocale } from '@/vc-component/pagination';
import { computed, defineComponent, type PropType } from 'vue';
import type { PickerLocale as DatePickerLocale } from '../date-picker/generatePicker';
import { LocaleContextProvider, type LocaleContextProps } from './context';

export { default as useLocale } from './useLocale';

export const ANT_MARK = 'internalMark';
export interface Locale {
  locale: string;
  Pagination?: PaginationLocale;
  DatePicker?: DatePickerLocale;
  TimePicker?: Record<string, any>;
  Calendar?: Record<string, any>;
  Table?: any;
  Modal?: any;
  Tour?: any;
  Popconfirm?: any;
  Transfer?: any;
  Select?: Record<string, any>;
  Upload?: any;
  Empty?: any;
  global?: {
    placeholder?: string;
    close?: string;
    sortable?: string;
  };
  Icon?: Record<string, any>;
  Text?: {
    edit?: any;
    copy?: any;
    copied?: any;
    expand?: any;
    collapse?: any;
  };
  Form?: {
    optional?: string;
    defaultValidateMessages: any;
  };
  Image?: {
    preview: string;
  };
  QRCode?: {
    expired?: string;
    refresh?: string;
    scanned?: string;
  };
  ColorPicker?: {
    presetEmpty: string;
    transparent: string;
    singleColor: string;
    gradientColor: string;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  /** @internal */
  _ANT_MARK__?: string;
}

export const LocaleProvider = defineComponent({
  props: {
    locale: {
      type: Object as PropType<Locale>,
      default: () => ({}),
    },
    _ANT_MARK__: String,
  },
  setup(props, { slots }) {
    // watch(
    //   () => props.locale,
    //   () => {
    //     const clearLocale = changeConfirmLocale(locale?.Modal);
    //   },
    //   { deep: true, immediate: true },
    // );

    const getMemoizedContextValue = computed((): LocaleContextProps => ({ ...props.locale, exist: true }));

    return () => <LocaleContextProvider value={getMemoizedContextValue.value}>{slots.default?.()}</LocaleContextProvider>;
  },
});
