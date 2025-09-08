import pickAttrs from '@/vc-util/pickAttrs';
import warning from '@/vc-util/warning';
import { toReactive } from '@vueuse/core';
import { computed, toRefs, type Ref } from 'vue';
import type { SelectorProps } from '../../../interface';
import { formatValue } from '../../../utils/dateUtil';
import type { InputProps } from '../Input.vue';

export default function useInputProps<DateType extends object = any>(
  props: Ref<
    Pick<
      SelectorProps,
      | 'maskFormat'
      | 'format'
      | 'generateConfig'
      | 'locale'
      | 'preserveInvalidOnBlur'
      | 'inputReadOnly'
      | 'required'
      | 'aria-required'
      | 'onSubmit'
      | 'onFocus'
      | 'onBlur'
      | 'onInputChange'
      | 'onInvalid'
      | 'onOpenChange'
      | 'onKeydown'
      | 'activeHelp'
      | 'name'
      | 'autocomplete'
      | 'open'
      | 'picker'
    > & {
      id?: string | string[];
      value?: DateType[];
      invalid?: boolean | [boolean, boolean];
      placeholder?: string | [string, string];
      disabled?: boolean | [boolean, boolean];
      onChange: (value: DateType | null, index?: number) => void;

      // RangePicker only
      allHelp: boolean;
      activeIndex?: number | null;
    }
  >,
  /** Used for SinglePicker */
  postProps?: (info: { valueTexts: string[] }) => Partial<InputProps>,
) {
  const {
    format,
    maskFormat,
    generateConfig,
    locale,
    preserveInvalidOnBlur,
    inputReadOnly,
    required,
    'aria-required': ariaRequired,
    onSubmit,
    onFocus,
    onBlur,
    onInputChange,
    onInvalid,
    open,
    onOpenChange,
    onKeydown,
    onChange,
    activeHelp,
    name,
    autocomplete,

    id,
    value,
    invalid,
    placeholder,
    disabled,
    activeIndex,
    allHelp,

    picker,
  } = toRefs(toReactive(props));

  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const parsed = generateConfig?.value?.locale.parse(locale?.value?.locale, str, [formatStr]);
    return parsed && generateConfig?.value?.isValidate(parsed) ? parsed : null;
  };

  // ========================= Text =========================
  const firstFormat = computed(() => format.value[0]);

  const getText = (date) =>
    formatValue(date, { locale: locale?.value, format: firstFormat.value, generateConfig: generateConfig?.value });

  const valueTexts = computed(() => value.value.map(getText));

  // ========================= Size =========================
  const size = computed(() => {
    const defaultSize = picker.value === 'time' ? 8 : 10;
    const length =
      typeof firstFormat.value === 'function'
        ? firstFormat.value(generateConfig?.value?.getNow()).length
        : firstFormat.value?.length;
    return Math.max(defaultSize, length) + 2;
  });

  // ======================= Validate =======================
  const validateFormat = (text: string) => {
    for (let i = 0; i < format?.value?.length; i += 1) {
      const singleFormat = format?.value?.[i];

      // Only support string type
      if (typeof singleFormat === 'string') {
        const parsed = parseDate(text, singleFormat);

        if (parsed) {
          return parsed;
        }
      }
    }

    return false;
  };

  // ======================== Input =========================
  const getInputProps = (index?: number): InputProps => {
    function getProp<T>(propValue: T | T[]): T {
      return index !== undefined ? propValue[index] : (propValue as T);
    }

    const pickedAttrs = pickAttrs(props, { aria: true, data: true });
    const inputProps = {
      ...pickedAttrs,

      // ============== Shared ==============
      format: maskFormat.value,
      validateFormat: (text: string) => !!validateFormat(text),
      preserveInvalidOnBlur: preserveInvalidOnBlur.value,

      readOnly: inputReadOnly.value,

      required: required.value,
      'aria-required': ariaRequired?.value,

      name: name.value,

      autocomplete: autocomplete.value,

      size: size.value,

      // ============= By Index =============
      id: getProp(id.value),

      value: getProp(valueTexts.value) || '',

      invalid: getProp(invalid.value),

      placeholder: getProp(placeholder.value),

      active: activeIndex?.value === index,

      helped: allHelp.value || (activeHelp.value && activeIndex?.value === index),

      disabled: getProp(disabled.value),

      onFocus: (event) => {
        onFocus?.value?.(event, index);
      },
      onBlur: (event) => {
        // Blur do not trigger close
        // Since it may focus to the popup panel
        onBlur?.value?.(event, index);
      },

      onSubmit: onSubmit.value,

      // Get validate text value
      onChange: (text: string) => {
        onInputChange?.value?.();

        const parsed = validateFormat(text);

        if (parsed) {
          onInvalid?.value?.(false, index);
          onChange?.value?.(parsed, index);
          return;
        }

        // Tell outer that the value typed is invalid.
        // If text is empty, it means valid.
        onInvalid?.value?.(!!text, index);
      },
      onHelp: () => {
        onOpenChange?.value?.(true, { index });
      },
      onKeydown: (event: KeyboardEvent) => {
        let prevented = false;

        onKeydown?.value?.(event, () => {
          if (process.env.NODE_ENV !== 'production') {
            warning(false, '`preventDefault` callback is deprecated. Please call `event.preventDefault` directly.');
          }
          prevented = true;
        });

        if (!event.defaultPrevented && !prevented) {
          switch (event.key) {
            case 'Escape':
              onOpenChange?.value?.(false, { index });
              break;
            case 'Enter':
              if (!open) {
                onOpenChange?.value?.(true);
              }
              break;
          }
        }
      },

      // ============ Post Props ============
      ...postProps?.({ valueTexts: valueTexts.value }),
    };

    // ============== Clean Up ==============
    Object.keys(inputProps).forEach((key) => {
      if (inputProps[key] === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete inputProps[key];
      }
    });

    return inputProps;
  };

  return [getInputProps, getText] as const;
}
