<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="tsx" setup>
import { getDOM } from '@/vc-util/Dom/findDOMNode';
import clsx from 'clsx';
import { isEqual, omit } from 'es-toolkit/compat';
import { computed, getCurrentInstance, h, ref, useTemplateRef, watch } from 'vue';
import { useAllowClear } from '../hooks/useAllowClear';
import { BaseSelectContextProvider, type BaseSelectContextProps } from '../hooks/useBaseProps';
import useComponents from '../hooks/useComponents';
import useLock from '../hooks/useLock';
import useOpen from '../hooks/useOpen';
import useSelectTriggerControl from '../hooks/useSelectTriggerControl';
import type { DisplayValueType } from '../interface';
import SelectInput from '../SelectInput/index.vue';
import SelectTrigger from '../SelectTrigger.vue';
import { getSeparatedContent, isValidCount } from '../utils/valueUtil';
import { isMultiple, type BaseSelectProps, type RefOptionListProps } from './interface';
import Polite from './Polite.vue';

defineOptions({ name: 'BaseSelect', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,
  prefixCls,
  class: className,
  styles,
  classNames,
  showSearch,
  tagRender,
  showScrollBar = 'optional',
  direction,
  omitDomProps,

  // Value
  displayValues,
  onDisplayValuesChange,
  emptyOptions,
  notFoundContent = 'Not Found',
  onClear,
  maxCount,
  placeholder,

  // Mode
  mode,

  // Status
  disabled,
  loading,

  // Customize Input
  getInputElement,
  getRawInputElement,

  // Open
  onPopupVisibleChange,

  // Active
  activeValue,
  onActiveValueChange,
  activeDescendantId,

  // Search
  searchValue,
  autoClearSearchValue,
  onSearch,
  onSearchSplit,
  tokenSeparators,

  // Icons
  allowClear,
  prefix,
  suffix,

  // Dropdown
  OptionList,
  animation,
  transitionName,
  popupStyle,
  popupClassName,
  popupMatchSelectWidth,
  popupRender,
  popupAlign,
  placement,
  builtinPlacements,
  getPopupContainer,

  // Focus
  showAction = [],
  onFocus,
  onBlur,

  // Rest Events
  onKeyup,
  onKeydown,
  onMousedown,

  // Components
  components,

  // Rest Props
  ...restProps
} = defineProps<BaseSelectProps>();

// ============================== MISC ==============================
const multiple = computed(() => isMultiple(mode));

// ============================== Refs ==============================
const containerRef = useTemplateRef('containerRef');
const triggerRef = useTemplateRef('triggerRef');
const listRef = ref<RefOptionListProps>(null);

/** Used for component focused management */
const focused = ref(false);

// =========================== Imperative ===========================
defineExpose({
  focus: containerRef.value?.focus,
  blur: containerRef.value?.blur,
  scrollTo: (arg) => listRef.value?.scrollTo(arg),
  get nativeElement() {
    return getDOM(containerRef.value) as HTMLElement;
  },
});

// =========================== Components ===========================
const mergedComponents = useComponents(
  computed(() => components),
  getInputElement,
  getRawInputElement,
);

// ========================== Search Value ==========================
const mergedSearchValue = computed(() => {
  if (mode !== 'combobox') {
    return searchValue;
  }

  const val = displayValues[0]?.value;

  return typeof val === 'string' || typeof val === 'number' ? String(val) : '';
});

// ========================== Custom Input ==========================
// Only works in `combobox`
const customizeInputElement = computed(
  () => (mode === 'combobox' && typeof getInputElement === 'function' && getInputElement()) || null,
);

// ============================== Open ==============================
// Not trigger `open` when `notFoundContent` is empty
const emptyListContent = computed(() => !notFoundContent && emptyOptions);

const open = defineModel('open', { default: false });

const [mergedOpen, triggerOpen] = useOpen(open, onPopupVisibleChange, (nextOpen) =>
  disabled || emptyListContent.value ? false : nextOpen,
);

// ============================= Search =============================
const tokenWithEnter = computed((): boolean =>
  (tokenSeparators || []).some((tokenSeparator) => ['\n', '\r\n'].includes(tokenSeparator)),
);

const onInternalSearch = (searchText: string, fromTyping: boolean, isCompositing: boolean) => {
  if (multiple.value && isValidCount(maxCount) && displayValues.length >= maxCount) {
    return;
  }
  let ret = true;
  let newSearchText = searchText;
  onActiveValueChange?.(null);

  const separatedList = getSeparatedContent(
    searchText,
    tokenSeparators,
    isValidCount(maxCount) ? maxCount - displayValues.length : undefined,
  );

  // Check if match the `tokenSeparators`
  const patchLabels: string[] = isCompositing ? null : separatedList;

  // Ignore combobox since it's not split-able
  if (mode !== 'combobox' && patchLabels) {
    newSearchText = '';

    onSearchSplit?.(patchLabels);

    // Should close when paste finish
    triggerOpen(false);

    // Tell Selector that break next actions
    ret = false;
  }

  if (onSearch && mergedSearchValue.value !== newSearchText) {
    onSearch(newSearchText, {
      source: fromTyping ? 'typing' : 'effect',
    });
  }

  // Open if from typing
  if (searchText && fromTyping && ret) {
    triggerOpen(true);
  }

  return ret;
};

// Only triggered when menu is closed & mode is tags
// If menu is open, OptionList will take charge
// If mode isn't tags, press enter is not meaningful when you can't see any option
const onInternalSearchSubmit = (searchText: string) => {
  // prevent empty tags from appearing when you click the Enter button
  if (!searchText || !searchText.trim()) {
    return;
  }
  onSearch(searchText, { source: 'submit' });
};

// Close will clean up single mode search text
watch(
  [mergedOpen, multiple, () => mode],
  () => {
    if (!mergedOpen.value && !multiple.value && mode !== 'combobox') {
      onInternalSearch('', false, false);
    }
  },
  { immediate: true },
);

// ============================ Disabled ============================
// Close dropdown & remove focus state when disabled change
watch(
  [mergedOpen, () => disabled],
  () => {
    if (disabled) {
      triggerOpen(false);
      focused.value = false;
    }
  },
  { immediate: true },
);

// ============================ Keyboard ============================
/**
 * We record input value here to check if can press to clean up by backspace
 * - null: Key is not down, this is reset by key up
 * - true: Search text is empty when first time backspace down
 * - false: Search text is not empty when first time backspace down
 */
const [getClearLock, setClearLock] = useLock();
const keyLockRef = ref(false);

// KeyDown
const onInternalKeyDown = (event) => {
  const clearLock = getClearLock();
  const { key } = event;

  const isEnterKey = key === 'Enter';

  if (isEnterKey) {
    // Do not submit form when type in the input
    if (mode !== 'combobox') {
      event.preventDefault();
    }

    // We only manage open state here, close logic should handle by list component
    if (!mergedOpen.value) {
      triggerOpen(true);
    }
  }

  setClearLock(!!mergedSearchValue.value);

  // Remove value by `backspace`
  if (key === 'Backspace' && !clearLock && multiple.value && !mergedSearchValue.value && displayValues.length) {
    const cloneDisplayValues = [...displayValues];
    let removedDisplayValue = null;

    for (let i = cloneDisplayValues.length - 1; i >= 0; i -= 1) {
      const current = cloneDisplayValues[i];

      if (!current.disabled) {
        cloneDisplayValues.splice(i, 1);
        removedDisplayValue = current;
        break;
      }
    }

    if (removedDisplayValue) {
      onDisplayValuesChange(cloneDisplayValues, {
        type: 'remove',
        values: [removedDisplayValue],
      });
    }
  }

  if (mergedOpen.value && (!isEnterKey || !keyLockRef.value)) {
    // Lock the Enter key after it is pressed to avoid repeated triggering of the onChange event.
    if (isEnterKey) {
      keyLockRef.value = true;
    }
    listRef.value?.onKeydown(event);
  }

  onKeydown?.(event);
};

// KeyUp
const onInternalKeyUp = (event) => {
  if (mergedOpen.value) {
    listRef.value?.onKeyup(event);
  }
  if (event.key === 'Enter') {
    keyLockRef.value = false;
  }
  onKeyup?.(event);
};

// ============================ Selector ============================
const onSelectorRemove = (val: DisplayValueType) => {
  const newValues = displayValues.filter((i) => !isEqual(i, val));

  onDisplayValuesChange(newValues, {
    type: 'remove',
    values: [val],
  });
};

const onInputBlur = () => {
  // Unlock the Enter key after the input blur; otherwise, the Enter key needs to be pressed twice to trigger the correct effect.
  keyLockRef.value = false;
};

// ========================== Focus / Blur ==========================
/** Record real focus status */

const onInternalFocus = (e) => {
  focused.value = true;

  if (!disabled) {
    // `showAction` should handle `focus` if set
    if (showAction.includes('focus')) {
      triggerOpen(true);
    }

    onFocus?.(e);
  }
};

const onInternalBlur = (e) => {
  focused.value = false;

  if (mergedSearchValue.value) {
    // `tags` mode should move `searchValue` into values
    if (mode === 'tags') {
      onSearch(mergedSearchValue.value, { source: 'submit' });
    } else if (mode === 'multiple') {
      // `multiple` mode only clean the search value but not trigger event
      onSearch('', {
        source: 'blur',
      });
    }
  }

  if (!disabled) {
    triggerOpen(false, {
      lazy: true,
    });
    onBlur?.(e);
  }
};

const onInternalMouseDown = (event) => {
  const { target } = event;
  const popupElement: HTMLDivElement = triggerRef.value?.getPopupElement?.();
  // We should give focus back to selector if clicked item is not focusable
  if (popupElement?.contains(target as HTMLElement) && triggerOpen) {
    // Tell `open` not to close since it's safe in the popup
    triggerOpen(true, {
      ignoreNext: true,
    });
  }

  onMousedown?.(event);
};

// // ============================ Dropdown ============================
const forceUpdate = ref(Symbol('update'));
// We need force update here since popup dom is render async
function onPopupMouseEnter() {
  forceUpdate.value = Symbol('update');
}

// Used for raw custom input trigger
const onTriggerVisibleChange = computed((): null | ((newOpen: boolean) => void) => {
  if (mergedComponents.root) {
    return (newOpen: boolean) => {
      triggerOpen(newOpen);
    };
  }
  return null;
});

// Close when click on non-select element
useSelectTriggerControl(
  () => [getDOM(containerRef.value) as any, triggerRef.value?.getPopupElement?.()],
  mergedOpen,
  triggerOpen,
  computed(() => !!mergedComponents.root),
);

// ============================ Context =============================
const vm = getCurrentInstance();
const baseSelectContext = computed<BaseSelectContextProps>(() => ({
  ...(vm.props as any),
  notFoundContent,
  open: mergedOpen.value,
  triggerOpen: mergedOpen.value,
  id,
  showSearch,
  multiple,
  toggleOpen: triggerOpen,
  showScrollBar,
  styles,
  classNames,
}));

// ==================================================================
// ==                            Render                            ==
// ==================================================================

// ============================= Suffix =============================

const mergedSuffixIcon = computed(() => {
  const nextSuffix = suffix;

  if (typeof nextSuffix === 'function') {
    return (nextSuffix as any)({
      searchValue: mergedSearchValue.value,
      open: mergedOpen.value,
      focused: focused.value,
      showSearch,
      loading,
    });
  }
  return nextSuffix;
});

// ============================= Clear ==============================
const onClearMouseDown = () => {
  onClear?.();

  containerRef.value?.focus();

  onDisplayValuesChange([], {
    type: 'clear',
    values: displayValues,
  });
  onInternalSearch('', false, false);
};

const { allowClear: mergedAllowClear, clearIcon: clearNode } = useAllowClear(
  computed(() => prefixCls),
  computed(() => displayValues),
  computed(() => allowClear),
  computed(() => disabled),
  mergedSearchValue,
  computed(() => mode),
);

// ============================= Select =============================
const mergedClassName = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-focused`]: focused.value,
    [`${prefixCls}-multiple`]: multiple.value,
    [`${prefixCls}-single`]: !multiple.value,
    [`${prefixCls}-allow-clear`]: mergedAllowClear?.value,
    [`${prefixCls}-show-arrow`]: mergedSuffixIcon?.value !== undefined && mergedSuffixIcon?.value !== null,
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-open`]: mergedOpen.value,
    [`${prefixCls}-customize-input`]: customizeInputElement.value,
    [`${prefixCls}-show-search`]: showSearch,
  });
});
</script>
<template>
  <BaseSelectContextProvider :value="baseSelectContext">
    <Polite :visible="focused && !mergedOpen" :values="displayValues" />
    <SelectTrigger
      ref="triggerRef"
      :disabled="disabled"
      :prefix-cls="prefixCls"
      :visible="mergedOpen"
      :popup-element="h(OptionList, { ref: listRef as any })"
      :animation="animation"
      :transition-name="transitionName"
      :popup-style="popupStyle"
      :popup-class-name="popupClassName"
      :direction="direction"
      :popup-match-select-width="popupMatchSelectWidth"
      :popup-render="popupRender"
      :popup-align="popupAlign"
      :placement="placement"
      :builtin-placements="builtinPlacements"
      :get-popup-container="getPopupContainer"
      :empty="emptyOptions"
      @popup-visible-change="onTriggerVisibleChange"
      @popup-mouse-enter="onPopupMouseEnter"
      @popup-mouse-down="onInternalMouseDown"
    >
      <template #default="props">
        <SelectInput
          v-bind="omit({ ...restProps, ...props }, ['onSearch'])"
          ref="containerRef"
          :prefix-cls="prefixCls"
          :class="mergedClassName"
          :focused="focused"
          :prefix="prefix"
          :suffix="mergedSuffixIcon"
          :clear-icon="clearNode"
          :multiple="multiple"
          :mode="mode"
          :display-values="displayValues"
          :placeholder="placeholder"
          :search-value="mergedSearchValue"
          :active-value="activeValue"
          @search="onInternalSearch"
          @search-submit="onInternalSearchSubmit"
          @input-blur="onInputBlur"
          @focus="onInternalFocus"
          @blur="onInternalBlur"
          @clear-mouse-down="onClearMouseDown"
          @keydown="onInternalKeyDown"
          @keyup="onInternalKeyUp"
          @selector-remove="onSelectorRemove"
          :token-with-enter="tokenWithEnter"
          @mousedown="onInternalMouseDown"
          :components="mergedComponents"
        />
      </template>
    </SelectTrigger>
  </BaseSelectContextProvider>
</template>
