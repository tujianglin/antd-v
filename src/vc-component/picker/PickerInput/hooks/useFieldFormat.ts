import type { Reactive } from 'vue';
import type { FormatType, InternalMode, Locale, SharedPickerProps } from '../../interface';
import { getRowFormat, toArray } from '../../utils/miscUtil';

export function useFieldFormat<DateType = any>(
  picker: InternalMode,
  locale: Locale,
  format?: SharedPickerProps['format'],
): Reactive<{ formatList: FormatType<DateType>[]; maskFormat?: string }> {
  const rawFormat = getRowFormat(picker, locale, format);

  const formatList = toArray(rawFormat);

  const firstFormat = formatList[0];
  const maskFormat = typeof firstFormat === 'object' && firstFormat.type === 'mask' ? firstFormat.format : null;
  return {
    formatList: formatList.map((config) => (typeof config === 'string' || typeof config === 'function' ? config : config.format)),
    maskFormat,
  };
}
