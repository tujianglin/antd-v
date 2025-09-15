<script lang="tsx" setup>
import { getDOM } from '@/vc-util/Dom/findDOMNode';
import isMobile from '@/vc-util/isMobile';
import { reactiveComputed } from '@vueuse/core';
import {
  cloneVNode,
  computed,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  toRefs,
  useTemplateRef,
  watch,
  type VNode,
} from 'vue';
import { BaseSelectContextProvider } from '../hooks/useBaseProps';
import useDelayReset from '../hooks/useDelayReset';
import useLock from '../hooks/useLock';
import useSelectTriggerControl from '../hooks/useSelectTriggerControl';
import type { DisplayValueType } from '../interface';
import Selector from '../Selector/index.vue';
import type { RefSelectorProps } from '../Selector/interface';
import SelectTrigger, { type RefTriggerProps } from '../SelectTrigger.vue';
import { getSeparatedContent, isValidCount } from '../utils/valueUtil';
import { DEFAULT_OMIT_PROPS, isMultiple, type BaseSelectProps, type RefOptionListProps } from './interface';
import TransBtn from '../TransBtn.vue';
import clsx from 'clsx';
import { useAllowClear } from '../hooks/useAllowClear';
import { omit } from 'lodash-es';
import Render from '@/components/render/render';
import { falseToUndefined } from '@/vc-util/props';
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
  suffixIcon,

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

  // Rest Props
  ...restProps
} = defineProps<BaseSelectProps>();

// ============================== MISC ==============================
const multiple = computed(() => isMultiple(mode));
const mergedShowSearch = computed(() => (showSearch !== undefined ? showSearch : multiple.value) || mode === 'combobox');

const domProps = computed((): Record<string, any> => {
  const result = {
    ...restProps,
  };
  DEFAULT_OMIT_PROPS.forEach((propName) => {
    delete result[propName];
  });

  omitDomProps?.forEach((propName) => {
    delete result[propName];
  });
  return falseToUndefined(result);
});

// ============================= Mobile =============================
const mobile = ref(false);
onMounted(() => {
  // Only update on the client side
  mobile.value = isMobile();
});

// ============================== Refs ==============================
const containerRef = useTemplateRef('containerRef');
const triggerRef = ref<RefTriggerProps>(null);
const selectorRef = ref<RefSelectorProps>(null);
const listRef = ref<RefOptionListProps>(null);
const blurRef = ref<boolean>(false);
const customDomRef = ref<HTMLElement>(null);

/** Used for component focused management */
const [mockFocused, setMockFocused, cancelSetMockFocused] = useDelayReset();

// =========================== Imperative ===========================
defineExpose({
  focus: selectorRef.value?.focus,
  blur: selectorRef.value?.blur,
  scrollTo: (arg) => listRef.value?.scrollTo(arg),
  get nativeElement() {
    return containerRef.value || selectorRef.value?.nativeElement || (getDOM(customDomRef.value) as HTMLElement);
  },
});

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

// Used for customize replacement for `rc-cascader`
const customizeRawInputElement = computed(() => typeof getRawInputElement === 'function' && (getRawInputElement() as VNode));

const customizeRawInputRef = ref(null);

// ============================== Open ==============================
// SSR not support Portal which means we need delay `open` for the first time render
const rendered = ref(false);
onMounted(() => {
  rendered.value = true;
});

const innerOpen = defineModel('open', { default: false });

const { mergedOpen, triggerOpen } = toRefs(
  reactiveComputed(() => {
    let mergedOpen = rendered.value ? innerOpen.value : false;
    // Not trigger `open` in `combobox` when `notFoundContent` is empty
    const emptyListContent = !notFoundContent && emptyOptions;
    if (disabled || (emptyListContent && mergedOpen && mode === 'combobox')) {
      mergedOpen = false;
    }
    const triggerOpen = emptyListContent ? false : mergedOpen;
    return { mergedOpen, triggerOpen };
  }),
);

const onToggleOpen = (newOpen?: boolean) => {
  const nextOpen = newOpen !== undefined ? newOpen : !mergedOpen.value;
  if (!disabled) {
    if (mergedOpen.value !== nextOpen) {
      onPopupVisibleChange?.(nextOpen);
    }
    innerOpen.value = nextOpen;
  }
};

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
    onToggleOpen(false);

    // Tell Selector that break next actions
    ret = false;
  }

  if (onSearch && mergedSearchValue.value !== newSearchText) {
    onSearch(newSearchText, {
      source: fromTyping ? 'typing' : 'effect',
    });
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
  [() => mergedOpen.value, () => multiple.value, () => mode],
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
  [() => innerOpen.value, () => disabled],
  () => {
    if (innerOpen.value && disabled) {
      innerOpen.value = false;
    }

    // After onBlur is triggered, the focused does not need to be reset
    if (disabled && !blurRef.value) {
      setMockFocused(false);
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
      onToggleOpen(true);
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
  const newValues = displayValues.filter((i) => i !== val);

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
const focusRef = ref<boolean>(false);

const onContainerFocus = (e) => {
  setMockFocused(true);

  if (!disabled) {
    if (onFocus && !focusRef.value) {
      onFocus(e);
    }

    // `showAction` should handle `focus` if set
    if (showAction.includes('focus')) {
      onToggleOpen(true);
    }
  }
  focusRef.value = true;
};

const onContainerBlur = (e) => {
  blurRef.value = true;

  setMockFocused(false, () => {
    if (focusRef.value) return;
    focusRef.value = false;
    blurRef.value = false;
    onToggleOpen(false);
  });

  if (disabled) {
    return;
  }

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

  if (onBlur) {
    onBlur(e);
  }
};

// Give focus back of Select
const activeTimeoutIds: any[] = [];
onBeforeUnmount(() => {
  activeTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
  activeTimeoutIds.splice(0, activeTimeoutIds.length);
});

const onInternalMouseDown = (event) => {
  const { target } = event;
  const popupElement: HTMLDivElement = triggerRef.value?.getPopupElement;
  // We should give focus back to selector if clicked item is not focusable
  if (popupElement && popupElement.contains(target as HTMLElement)) {
    const timeoutId = setTimeout(() => {
      const index = activeTimeoutIds.indexOf(timeoutId);
      if (index !== -1) {
        activeTimeoutIds.splice(index, 1);
      }

      cancelSetMockFocused();

      if (!mobile.value && !popupElement.contains(document.activeElement)) {
        selectorRef.value?.focus();
      }
    });

    activeTimeoutIds.push(timeoutId);
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
  if (customizeRawInputElement.value) {
    return (newOpen: boolean) => {
      onToggleOpen(newOpen);
    };
  }
  return null;
});

// Close when click on non-select element
useSelectTriggerControl(
  () => {
    return [containerRef.value, triggerRef.value?.getPopupElement];
  },
  triggerOpen,
  onToggleOpen,
  computed(() => !!customizeRawInputElement.value),
);

// ==================================================================
// ==                            Render                            ==
// ==================================================================

// ============================= Arrow ==============================
const showSuffixIcon = computed(() => !!suffixIcon || loading);

// ============================= Clear ==============================
const onClearMouseDown = () => {
  onClear?.();

  selectorRef.value?.focus();

  onDisplayValuesChange([], {
    type: 'clear',
    values: displayValues,
  });
  onInternalSearch('', false, false);
};

const { allowClear: mergedAllowClear, clearIcon: clearNode } = useAllowClear(
  prefixCls,
  onClearMouseDown,
  computed(() => displayValues),
  computed(() => allowClear),
  computed(() => disabled),
  mergedSearchValue,
  mode,
);

// ============================= Select =============================
const mergedClassName = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-focused`]: mockFocused.value,
    [`${prefixCls}-multiple`]: multiple.value,
    [`${prefixCls}-single`]: !multiple.value,
    [`${prefixCls}-allow-clear`]: allowClear,
    [`${prefixCls}-show-arrow`]: showSuffixIcon.value,
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-open`]: mergedOpen.value,
    [`${prefixCls}-customize-input`]: customizeInputElement.value,
    [`${prefixCls}-show-search`]: mergedShowSearch.value,
  });
});

const vm = getCurrentInstance();

// >>> Selector
const SelectorNode = () => {
  return (
    <SelectTrigger
      ref={triggerRef}
      disabled={disabled}
      prefixCls={prefixCls}
      visible={triggerOpen.value}
      popupElement={h(OptionList, { ref: listRef })}
      animation={animation}
      transitionName={transitionName}
      popupStyle={popupStyle}
      popupClassName={popupClassName}
      direction={direction}
      popupMatchSelectWidth={popupMatchSelectWidth}
      popupRender={popupRender}
      popupAlign={popupAlign}
      placement={placement}
      builtinPlacements={builtinPlacements}
      getPopupContainer={getPopupContainer}
      empty={emptyOptions}
      onPopupVisibleChange={onTriggerVisibleChange.value}
      onPopupMouseEnter={onPopupMouseEnter}
    >
      {{
        default: (props) => {
          return (
            <>
              {customizeRawInputElement.value ? (
                cloneVNode(customizeRawInputElement.value, { ref: customizeRawInputRef, ...props })
              ) : (
                <Selector
                  {...omit({ ...vm.props, ...props }, ['onSearch'])}
                  prefixClassName={classNames?.prefix || ''}
                  prefixStyle={styles?.prefix || {}}
                  prefixCls={prefixCls}
                  inputElement={customizeInputElement.value}
                  ref={selectorRef}
                  id={id}
                  prefix={prefix}
                  showSearch={mergedShowSearch.value}
                  autoClearSearchValue={autoClearSearchValue}
                  mode={mode}
                  activeDescendantId={activeDescendantId}
                  tagRender={tagRender}
                  values={displayValues}
                  open={mergedOpen.value}
                  onToggleOpen={onToggleOpen}
                  activeValue={activeValue || ''}
                  searchValue={mergedSearchValue.value}
                  onSearch={onInternalSearch}
                  onSearchSubmit={onInternalSearchSubmit}
                  onRemove={onSelectorRemove}
                  tokenWithEnter={tokenWithEnter.value}
                  onInputBlur={onInputBlur}
                />
              )}
            </>
          );
        },
      }}
    </SelectTrigger>
  );
};
</script>
<template>
  <BaseSelectContextProvider
    :value="{
      ...$props,
      notFoundContent,
      open: mergedOpen,
      triggerOpen,
      id,
      showSearch: mergedShowSearch,
      multiple,
      toggleOpen: onToggleOpen,
      showScrollBar,
      styles,
      classNames,
    }"
  >
    <SelectorNode v-if="customizeRawInputElement" />

    <div
      v-else
      :class="mergedClassName"
      v-bind="domProps"
      ref="containerRef"
      @mousedown="onInternalMouseDown"
      @keydown.capture="onInternalKeyDown"
      @keyup.capture="onInternalKeyUp"
      @focusin="onContainerFocus"
      @focusout="onContainerBlur"
    >
      <Polite :visible="mockFocused && !mergedOpen" :values="displayValues" />
      <SelectorNode />
      <TransBtn
        v-if="showSuffixIcon"
        :class="
          clsx(`${prefixCls}-arrow`, classNames?.suffix, {
            [`${prefixCls}-arrow-loading`]: loading,
          })
        "
        :style="styles?.suffix"
        :customize-icon="suffixIcon"
        :customize-icon-props="{
          loading,
          searchValue: mergedSearchValue,
          open: mergedOpen,
          focused: mockFocused,
          showSearch: mergedShowSearch,
        }"
      />
      <Render :content="mergedAllowClear && clearNode" />
    </div>
  </BaseSelectContextProvider>
</template>
