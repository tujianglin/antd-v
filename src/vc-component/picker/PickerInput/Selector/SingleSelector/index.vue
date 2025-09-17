<script lang="tsx" setup generic="DateType extends object = any">
import { Render } from '@/components';
import clsx from 'clsx';
import { computed, getCurrentInstance, h, toRefs, useAttrs, useTemplateRef } from 'vue';
import type { InternalMode, SelectorProps, SharedHTMLAttrs } from '../../../interface';
import { isSame } from '../../../utils/dateUtil';
import { usePickerContextInject } from '../../context';
import type { PickerProps } from '../../SinglePicker.vue';
import ClearIcon from '../ClearIcon.vue';
import useInputProps from '../hooks/useInputProps';
import useRootProps from '../hooks/useRootProps';
import Icon from '../Icon.vue';
import Input from '../Input.vue';
import MultipleDates from './MultipleDates.vue';

export interface SingleSelectorProps<DateType extends object = any>
  extends SelectorProps<DateType>,
    Pick<PickerProps, 'multiple' | 'maxTagCount'> {
  id?: string;

  value?: DateType[];
  onChange: (date: DateType[]) => void;

  internalPicker: InternalMode;

  disabled: boolean;

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string;

  // Invalid
  invalid: boolean;
  onInvalid: (valid: boolean) => void;

  removeIcon?: any;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id: _id,

  open,

  prefix,
  clearIcon,
  suffixIcon,
  activeHelp: _activeHelp,
  allHelp: _allHelp,

  focused,
  onFocus: _onFocus,
  onBlur: _onBlur,
  onKeydown: _onKeydown,
  locale,
  generateConfig,

  // Placeholder
  placeholder,

  // Style
  class: className,
  style,

  // Click
  onClick,
  onClear,

  // Change
  internalPicker,
  value,
  onChange,
  onSubmit,
  onInputChange: _onInputChange,
  multiple,
  maxTagCount,

  // Valid
  format: _format,
  maskFormat: _maskFormat,
  preserveInvalidOnBlur: _preserveInvalidOnBlur,
  onInvalid: _onInvalid,

  // Disabled
  disabled,
  invalid,
  inputReadOnly: _inputReadOnly,

  // Direction
  direction,

  // Open
  onOpenChange: _onOpenChange,

  // Native
  onMousedown,

  // Input
  required: _required,
  'aria-required': _ariaRequired,
  autofocus,
  tabindex,

  removeIcon,

  ...restProps
} = defineProps<SingleSelectorProps<DateType>>();

const attrs = useAttrs() as SharedHTMLAttrs;

const rtl = computed(() => direction === 'rtl');

// ======================== Prefix ========================
const { prefixCls, classNames, styles } = toRefs(usePickerContextInject());

// ========================= Refs =========================
const rootRef = useTemplateRef('rootRef');
const inputRef = useTemplateRef<HTMLInputElement & { inputElement?: HTMLInputElement }>('inputRef');

defineExpose({
  get nativeElement() {
    return rootRef.value;
  },
  focus: (options?: FocusOptions) => {
    inputRef.value?.focus(options);
  },
  blur: () => {
    inputRef.value?.blur();
  },
});

// ======================== Props =========================
const rootProps = computed(() => useRootProps({ ...restProps, ...attrs }));

// ======================== Change ========================
const onSingleChange = (date: DateType) => {
  onChange([date]);
};

const onMultipleRemove = (date: DateType) => {
  const nextValues = value.filter((oriDate) => oriDate && !isSame(generateConfig, locale, oriDate, date, internalPicker));
  onChange(nextValues);

  // When `open`, it means user is operating the
  if (!open) {
    onSubmit();
  }
};

// ======================== Inputs ========================
const vm = getCurrentInstance();
const [getInputProps, getText] = useInputProps<DateType>(
  computed(() => {
    return {
      ...vm.props,
      ...attrs,
      onChange: onSingleChange,
    } as any;
  }),
  ({ valueTexts }) => {
    return {
      value: valueTexts[0] || '',
      active: focused,
    };
  },
);

// ======================== Clear =========================
const showClear = computed(() => !!(clearIcon && value.length && !disabled));
</script>
<template>
  <div
    v-bind="rootProps"
    :class="
      clsx(
        prefixCls,
        {
          [`${prefixCls}-multiple`]: multiple,
          [`${prefixCls}-focused`]: focused,
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-invalid`]: invalid,
          [`${prefixCls}-rtl`]: rtl,
        },
        className,
      )
    "
    :style="style"
    ref="rootRef"
    @click="onClick"
    @mousedown="
      (e) => {
        const { target } = e;
        if (target !== inputRef?.inputElement) {
          e.preventDefault();
        }
        onMousedown?.(e);
      }
    "
  >
    <div v-if="prefix" :class="clsx(`${prefixCls}-prefix`, classNames.prefix)" :style="styles?.prefix">
      <Render :content="prefix" />
    </div>
    <template v-if="multiple">
      <MultipleDates
        :prefix-cls="prefixCls"
        :value="value"
        @remove="onMultipleRemove"
        :format-date="getText"
        :max-tag-count="maxTagCount"
        :disabled="disabled"
        :remove-icon="removeIcon"
        :placeholder="placeholder"
      />
      <input
        :class="`${prefixCls}-multiple-input`"
        :value="value.map(getText).join(',')"
        ref="inputRef"
        readonly
        :autofocus="autofocus"
        :tabindex="tabindex"
      />
      <Icon type="suffix" :icon="suffixIcon" />
      <ClearIcon v-if="showClear" :icon="clearIcon" @clear="onClear" />
    </template>
    <Input
      v-else
      ref="inputRef"
      v-bind="getInputProps()"
      :autofocus="autofocus"
      :tabindex="tabindex"
      :suffix-icon="suffixIcon"
      :clear-icon="showClear ? () => h(ClearIcon, { icon: clearIcon, onClear }) : ''"
      :show-active-cls="false"
    />
  </div>
</template>
