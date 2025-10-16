<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="tsx" setup>
import Render from '@/vc-component/render';
import ResizeObserver from '@/vc-component/resize-observer';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, watch, type CSSProperties } from 'vue';
import type { SelectorProps } from '../../interface';
import { usePickerContextInject } from '../context';
import ClearIcon from './ClearIcon.vue';
import useInputProps from './hooks/useInputProps';
import useRootProps from './hooks/useRootProps';
import Icon from './Icon.vue';
import type { InputRef } from './Input.vue';
import Input from './Input.vue';

export type SelectorIdType =
  | string
  | {
      start?: string;
      end?: string;
    };

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: SelectorIdType;

  activeIndex: number | null;

  separator?: VueNode;

  value?: [DateType?, DateType?];
  onChange: (date: DateType, index?: number) => void;

  disabled: [boolean, boolean];

  /** All the field show as `placeholder` */
  allHelp: boolean;

  placeholder?: string | [string, string];

  // Invalid
  invalid: [boolean, boolean];
  placement?: string;
  // Offset
  /**
   * Trigger when the active bar offset position changed.
   * This is used for popup panel offset.
   */
  onActiveInfo: (info: [activeInputLeft: number, activeInputRight: number, selectorWidth: number]) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,

  prefix,
  clearIcon,
  suffixIcon,
  separator = '~',
  activeIndex,
  activeHelp,
  allHelp,

  focused,
  onFocus,
  onBlur,
  onKeydown,
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
  value,
  onChange,
  onSubmit,
  onInputChange,

  // Valid
  format,
  maskFormat,
  preserveInvalidOnBlur,
  onInvalid,

  // Disabled
  disabled,
  invalid,
  inputReadOnly,

  // Direction
  direction,

  // Open
  onOpenChange,

  // Offset
  onActiveInfo,
  placement,

  // Native
  onMousedown,

  // Input
  required,
  'aria-required': ariaRequired,
  autofocus,
  tabindex,

  ...restProps
} = defineProps<RangeSelectorProps>();

const rtl = computed(() => direction === 'rtl');

// ======================== Prefix ========================
const { prefixCls, classNames, styles } = toRefs(usePickerContextInject());

// ========================== Id ==========================
const ids = computed(() => {
  if (typeof id === 'string') {
    return [id];
  }

  const mergedId = id || {};

  return [mergedId.start, mergedId.end];
});

// ========================= Refs =========================
const rootRef = ref<HTMLDivElement>();
const inputStartRef = ref<InputRef>();
const inputEndRef = ref<InputRef>();

const getInput = (index: number) => [inputStartRef, inputEndRef][index]?.value;

defineExpose({
  get nativeElement() {
    return rootRef.value;
  },
  focus: (options) => {
    if (typeof options === 'object') {
      const { index = 0, ...rest } = options || {};
      getInput(index)?.focus(rest);
    } else {
      getInput(options ?? 0)?.focus();
    }
  },
  blur: () => {
    getInput(0)?.blur();
    getInput(1)?.blur();
  },
});

// ======================== Props =========================
const rootProps = computed(() => useRootProps(restProps));

// ===================== Placeholder ======================
const mergedPlaceholder = computed<[string, string]>(() =>
  Array.isArray(placeholder) ? placeholder : [placeholder, placeholder],
);
const vm = getCurrentInstance();
// ======================== Inputs ========================
const [getInputProps] = useInputProps(
  computed(
    () =>
      ({
        ...vm.props,
        id: ids.value,
        placeholder: mergedPlaceholder.value,
      }) as any,
  ),
);

// ====================== ActiveBar =======================
const activeBarStyle = ref<CSSProperties>({
  position: 'absolute',
  width: 0,
});

const syncActiveOffset = () => {
  const input = getInput(activeIndex);
  if (input) {
    const inputRect = input.nativeElement.getBoundingClientRect();
    const parentRect = rootRef.value.getBoundingClientRect();

    const rectOffset = inputRect.left - parentRect.left;
    activeBarStyle.value = {
      ...activeBarStyle.value,
      width: `${inputRect.width}px`,
      left: `${rectOffset}px`,
    };
    onActiveInfo([inputRect.left, inputRect.right, parentRect.width]);
  }
};

watch(
  () => activeIndex,
  () => {
    syncActiveOffset();
  },
  { immediate: true },
);

// ======================== Clear =========================
const showClear = computed(() => clearIcon && ((value[0] && !disabled[0]) || (value[1] && !disabled[1])));

// ======================= Disabled =======================
const startAutoFocus = computed(() => autofocus && !disabled[0]);
const endAutoFocus = computed(() => autofocus && !startAutoFocus.value && !disabled[1]);
</script>
<template>
  <ResizeObserver @resize="syncActiveOffset">
    <div
      v-bind="rootProps"
      :class="
        clsx(
          prefixCls,
          `${prefixCls}-range`,
          {
            [`${prefixCls}-focused`]: focused,
            [`${prefixCls}-disabled`]: disabled.every((i) => i),
            [`${prefixCls}-invalid`]: invalid.some((i) => i),
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
          if (target !== inputStartRef.inputElement && target !== inputEndRef.inputElement) {
            e.preventDefault();
          }

          onMousedown?.(e);
        }
      "
    >
      <div v-if="prefix" :class="clsx(`${prefixCls}-prefix`, classNames.prefix)" :style="styles.prefix">
        <Render :content="prefix" />
      </div>
      <Input
        ref="inputStartRef"
        v-bind="getInputProps(0)"
        :class="`${prefixCls}-input-start`"
        :autofocus="startAutoFocus"
        :tabindex="tabindex"
        data-range="start"
      />
      <div :class="`${prefixCls}-range-separator`">
        <Render :content="separator" />
      </div>
      <Input
        ref="inputEndRef"
        v-bind="getInputProps(1)"
        :class="`${prefixCls}-input-end`"
        :autofocus="endAutoFocus"
        :tabindex="tabindex"
        data-range="end"
      />
      <div :class="`${prefixCls}-active-bar`" :style="activeBarStyle"></div>
      <Icon type="suffix" :icon="suffixIcon" />
      <ClearIcon v-if="showClear" :icon="clearIcon" @clear="onClear" />
    </div>
  </ResizeObserver>
</template>
