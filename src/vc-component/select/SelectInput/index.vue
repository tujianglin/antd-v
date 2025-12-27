<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="tsx" setup>
import { Render } from '@/components';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import { getDOM } from '@/vc-util/Dom/findDOMNode';
import KeyCode from '@/vc-util/KeyCode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { computed, getCurrentInstance, toRefs, useAttrs, useTemplateRef, type CSSProperties, type HTMLAttributes } from 'vue';
import { useBaseSelectContextInject } from '../hooks/useBaseProps';
import type { ComponentsConfig } from '../hooks/useComponents';
import type { DisplayValueType, Mode } from '../interface';
import { isValidateOpenKey } from '../utils/keyUtil';
import Affix from './Affix.vue';
import SelectContent from './Content/index.vue';
import { SelectInputContextProvider } from './context';

export interface SelectInputRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  nativeElement: HTMLDivElement;
}

export interface SelectInputProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'prefix' | 'placeholder'> {
  prefixCls: string;
  prefix?: VueNode;
  suffix?: VueNode;
  clearIcon?: VueNode;
  removeIcon?: VueNode;
  multiple?: boolean;
  displayValues: DisplayValueType[];
  placeholder?: VueNode;
  searchValue?: string;
  activeValue?: string;
  mode?: Mode;
  autoClearSearchValue?: boolean;
  onSearch?: (searchText: string, fromTyping: boolean, isCompositing: boolean) => void;
  onSearchSubmit?: (searchText: string) => void;
  onInputBlur?: () => void;
  onClearMouseDown?: (e: MouseEvent) => void;
  onInputKeyDown?: (e: KeyboardEvent) => void;
  onSelectorRemove?: (value: DisplayValueType) => void;
  maxlength?: number;
  autofocus?: boolean;
  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter?: boolean;
  // Add other props that need to be passed through
  class?: string;
  style?: CSSProperties;
  focused?: boolean;
  components: ComponentsConfig;

  // Event
  onMousedown?: (e: MouseEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onKeyup?: (e: KeyboardEvent) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Style
  prefixCls,
  class: className,
  style,

  // UI
  prefix,
  suffix,
  clearIcon,

  // Data
  multiple,
  displayValues,
  placeholder,
  mode,

  // Search
  searchValue,
  onSearch,
  onSearchSubmit,
  onInputBlur,

  // Input
  maxlength,
  autofocus,

  // Events
  onMousedown,
  onBlur,
  onClearMouseDown,
  onInputKeyDown,
  onSelectorRemove,

  // Token handling
  tokenWithEnter,

  // Components
  components,

  ...restProps
} = defineProps<SelectInputProps>();

const DEFAULT_OMIT_PROPS = [
  'value',
  'onChange',
  'open',
  'removeIcon',
  'placeholder',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
  'onPopupScroll',
  'tabindex',
  'activeValue',
  'onSelectorRemove',
  'focused',
  'autoClearSearchValue',
] as const;

const { triggerOpen, toggleOpen, showSearch, disabled, loading, classNames, styles } = toRefs(useBaseSelectContextInject());

const rootRef = useTemplateRef<HTMLElement>('rootRef');
const inputRef = useTemplateRef<HTMLElement>('inputRef');

// Handle keyboard events similar to original Selector
const onInternalInputKeyDown = (event: KeyboardEvent) => {
  const { which } = event;

  // Compatible with multiple lines in TextArea
  const isTextAreaElement = inputRef.value instanceof HTMLTextAreaElement;
  // Prevent default behavior for up/down arrows when dropdown is open
  if (!isTextAreaElement && triggerOpen?.value && (which === KeyCode.UP || which === KeyCode.DOWN)) {
    event.preventDefault();
  }

  // Call the original onInputKeyDown callback
  if (onInputKeyDown) {
    onInputKeyDown(event);
  }

  // Move within the text box for TextArea
  if (isTextAreaElement && !triggerOpen?.value && ~[KeyCode.UP, KeyCode.DOWN, KeyCode.LEFT, KeyCode.RIGHT].indexOf(which)) {
    return;
  }

  // Open dropdown when a valid open key is pressed
  const isModifier = event.ctrlKey || event.altKey || event.metaKey;
  if (!isModifier && isValidateOpenKey(which)) {
    toggleOpen?.value?.(true);
  }
};

// ====================== Refs ======================
defineExpose({
  focus: (options?: FocusOptions) => {
    // Focus the inner input if available, otherwise fall back to root div.
    (inputRef.value || rootRef.value).focus?.(options);
  },
  blur: () => {
    (inputRef.value || rootRef.value).blur?.();
  },
  get nativeElement() {
    return rootRef?.value;
  },
});

// ====================== Open ======================
const onInternalMouseDown = (event) => {
  if (!disabled?.value) {
    if (event.target !== getDOM(inputRef.value)) {
      event.preventDefault();
    }

    // Check if we should prevent closing when clicking on selector
    // Don't close if: open && not multiple && (combobox mode || showSearch)
    const shouldPreventClose = triggerOpen?.value && !multiple && (mode === 'combobox' || showSearch.value);

    if (!(event as any)._select_lazy) {
      inputRef.value?.focus?.();

      // Only toggle open if we should not prevent close
      if (!shouldPreventClose) {
        toggleOpen?.value?.();
      }
    } else if (triggerOpen?.value) {
      // Lazy should also close when click clear icon
      toggleOpen?.value?.(false);
    }
  }
  onMousedown?.(event);
};

const onInternalBlur: SelectInputProps['onBlur'] = (event) => {
  toggleOpen?.value?.(false);
  onBlur?.(event);
};

// =================== Components ===================
const RootComponent = computed(() => components?.root);
// ===================== Render =====================
const attrs = useAttrs();
const domProps = computed<any>(() => omit({ ...restProps, ...attrs }, DEFAULT_OMIT_PROPS as any));

// Create context value with wrapped callbacks
const vm = getCurrentInstance();
const contextValue = computed(() => ({
  ...(vm.props as any),
  ...attrs,
  onInputKeyDown: onInternalInputKeyDown,
}));
</script>
<template>
  <template v-if="RootComponent">
    <component v-if="isValidElement(RootComponent)" :is="cloneElement(RootComponent, domProps)" ref="rootRef" />
    <component v-else :is="RootComponent" v-bind="domProps" ref="rootRef" />
  </template>
  <SelectInputContextProvider v-else :value="contextValue">
    <div
      v-bind="domProps"
      ref="rootRef"
      :class="className"
      :style="style"
      @mousedown="onInternalMouseDown"
      @blur="onInternalBlur"
    >
      <Affix v-if="prefix" :class="clsx(`${prefixCls}-prefix`, classNames?.prefix)" :style="styles?.prefix">
        <Render :content="prefix" />
      </Affix>
      <SelectContent ref="inputRef" />
      <Affix
        v-if="suffix"
        :class="
          clsx(
            `${prefixCls}-suffix`,
            {
              [`${prefixCls}-suffix-loading`]: loading,
            },
            classNames?.suffix,
          )
        "
        :style="styles?.suffix"
      >
        <Render :content="suffix" />
      </Affix>
      <Affix
        v-if="clearIcon"
        :class="clsx(`${prefixCls}-clear`, classNames?.clear)"
        :style="styles?.clear"
        @mousedown="
          (e) => {
            // Mark to tell not trigger open or focus
            (e as any)._select_lazy = true;
            onClearMouseDown?.(e);
          }
        "
      >
        <Render :content="clearIcon" />
      </Affix>
      <slot></slot>
    </div>
  </SelectInputContextProvider>
</template>
