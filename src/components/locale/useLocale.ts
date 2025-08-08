import { computed, type Ref } from 'vue';
import type { Locale } from '.';
import { useLocaleContextInject } from './context';
import defaultLocaleData from './en_US';

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>;

const useLocale = <C extends LocaleComponentName = LocaleComponentName>(
  componentName: C,
  defaultLocale?: Locale[C] | (() => Locale[C]),
): readonly [NonNullable<Locale[C]>, Ref<string>] => {
  const fullLocale = useLocaleContextInject();

  const getLocale = computed((): NonNullable<Locale[C]> => {
    const locale = defaultLocale || defaultLocaleData[componentName];
    const localeFromContext = fullLocale?.[componentName] ?? {};
    return {
      ...(typeof locale === 'function' ? (locale as () => void)() : locale),
      ...localeFromContext,
    };
  });

  const getLocaleCode = computed((): string => {
    const localeCode = fullLocale?.locale;
    // Had use LocaleProvide but didn't set locale
    if (fullLocale?.exist && !localeCode) {
      return defaultLocaleData.locale;
    }
    return localeCode!;
  });

  return [getLocale, getLocaleCode] as const;
};

export default useLocale;
