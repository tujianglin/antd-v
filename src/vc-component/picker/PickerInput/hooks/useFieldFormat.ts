import { computed, type Ref } from 'vue';
import type { FormatType, InternalMode, Locale, SharedPickerProps } from '../../interface';
import { getRowFormat, toArray } from '../../utils/miscUtil';

export function useFieldFormat<DateType = any>(
  picker: Ref<InternalMode>,
  locale: Ref<Locale>,
  format?: Ref<SharedPickerProps['format']>,
): [formatList: Ref<FormatType<DateType>[]>, maskFormat?: Ref<string>] {
  const formatList = computed(() => {
    const rawFormat = getRowFormat(picker.value, locale.value, format.value);
    return toArray(rawFormat);
  });

  const maskFormat = computed(() => {
    const firstFormat = formatList.value[0];
    return typeof firstFormat === 'object' && firstFormat.type === 'mask' ? firstFormat.format : null;
  });
  return [
    computed(() =>
      formatList.value.map((config) => (typeof config === 'string' || typeof config === 'function' ? config : config.format)),
    ),
    maskFormat,
  ];
}
