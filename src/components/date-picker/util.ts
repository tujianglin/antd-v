import type { PickerMode } from '@/vc-component/picker/interface';
import { reactiveComputed } from '@vueuse/core';
import { computed, type Ref } from 'vue';
import useSelectIcons from '../select/useIcons';
import type { PickerLocale, PickerProps } from './generatePicker';

export function getPlaceholder(locale: PickerLocale, picker?: PickerMode, customizePlaceholder?: string): string {
  if (customizePlaceholder !== undefined) {
    return customizePlaceholder;
  }

  if (picker === 'year' && locale.lang.yearPlaceholder) {
    return locale.lang.yearPlaceholder;
  }
  if (picker === 'quarter' && locale.lang.quarterPlaceholder) {
    return locale.lang.quarterPlaceholder;
  }
  if (picker === 'month' && locale.lang.monthPlaceholder) {
    return locale.lang.monthPlaceholder;
  }
  if (picker === 'week' && locale.lang.weekPlaceholder) {
    return locale.lang.weekPlaceholder;
  }
  if (picker === 'time' && locale.timePickerLocale.placeholder) {
    return locale!.timePickerLocale.placeholder;
  }
  return locale.lang.placeholder;
}

export function getRangePlaceholder(locale: PickerLocale, picker?: PickerMode, customizePlaceholder?: [string, string]) {
  if (customizePlaceholder !== undefined) {
    return customizePlaceholder;
  }

  if (picker === 'year' && locale.lang.yearPlaceholder) {
    return locale.lang.rangeYearPlaceholder;
  }
  if (picker === 'quarter' && locale.lang.quarterPlaceholder) {
    return locale.lang.rangeQuarterPlaceholder;
  }
  if (picker === 'month' && locale.lang.monthPlaceholder) {
    return locale.lang.rangeMonthPlaceholder;
  }
  if (picker === 'week' && locale.lang.weekPlaceholder) {
    return locale.lang.rangeWeekPlaceholder;
  }
  if (picker === 'time' && locale.timePickerLocale.placeholder) {
    return locale!.timePickerLocale.rangePlaceholder;
  }
  return locale.lang.rangePlaceholder;
}

export function useIcons(props: Ref<Pick<PickerProps, 'allowClear' | 'removeIcon'>>, prefixCls: Ref<string>) {
  const { clearIcon, removeIcon } = useSelectIcons(
    reactiveComputed(() => ({
      ...props.value,
      prefixCls: prefixCls.value,
      componentName: 'DatePicker',
    })),
  );

  const mergedAllowClear = computed(() => {
    const { allowClear = true } = props.value;
    if (allowClear === false) {
      return false;
    }

    const allowClearConfig = allowClear === true ? {} : allowClear;

    return {
      clearIcon: clearIcon.value,
      ...allowClearConfig,
    };
  });

  return [mergedAllowClear, removeIcon] as const;
}
