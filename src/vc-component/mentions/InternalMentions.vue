<script lang="tsx" setup>
import TextArea from '@/vc-component/textarea';
import KeyCode from '@/vc-util/KeyCode';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, ref, toRefs, useAttrs, useId, useTemplateRef, watch, type TextareaHTMLAttributes } from 'vue';
import { useUnstableContextInject } from './context';
import useEffectState from './hooks/useEffectState';
import KeywordTrigger from './KeywordTrigger.vue';
import type { MentionsProps } from './Mentions.vue';
import { MentionsContextProvider } from './MentionsContext';
import type { OptionProps } from './Option';
import {
  filterOption as defaultFilterOption,
  validateSearch as defaultValidateSearch,
  getBeforeSelectionText,
  getLastMeasureIndex,
  replaceWithMeasure,
  setInputSelection,
} from './util';
import { assign } from 'es-toolkit/compat';

interface InternalMentionsProps extends MentionsProps {
  hasWrapper: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Style
  prefixCls,
  class: className,
  style,
  classNames: mentionClassNames,
  styles,

  // Misc
  prefix = '@',
  split = ' ',
  notFoundContent = 'Not Found',
  options,
  allowClear: _,
  hasWrapper,
  silent,

  // Events
  validateSearch = defaultValidateSearch,
  filterOption = defaultFilterOption,
  onChange,
  onKeydown,
  onKeyup,
  onPressEnter,
  onSearch,
  onSelect,

  onFocus,
  onBlur,

  // Dropdown
  transitionName,
  placement,
  direction,
  getPopupContainer,
  popupClassName,

  // Fix Warning: Received `false` for a non-boolean attribute `visible`.
  // https://github.com/ant-design/ant-design/blob/df933e94efc8f376003bbdc658d64b64a0e53495/components/mentions/demo/render-panel.tsx
  // @ts-expect-error
  visible: _1,
  onPopupScroll,

  // Rest
  ...restProps
} = defineProps<InternalMentionsProps>();

const mergedPrefix = computed(() => (Array.isArray(prefix) ? prefix : [prefix]));

// =============================== Refs ===============================
const containerRef = useTemplateRef('containerRef');
const textareaRef = ref(null);
const measureRef = ref(null);

const getTextArea = () => {
  return textareaRef.value?.resizableTextArea?.textArea;
};

defineExpose({
  focus: textareaRef.value?.focus,
  blur: textareaRef.value?.blur,
  get textarea() {
    return textareaRef.value?.resizableTextArea?.textArea;
  },
  get nativeElement() {
    return containerRef.value;
  },
});

// ============================== State ===============================
const measuring = ref(false);
const measureText = ref('');
const measurePrefix = ref('');
const measureLocation = ref(0);
const activeIndex = ref(0);
const isFocus = ref(false);

// ================================ Id ================================
const id = useId();
const uniqueKey = computed(() => restProps?.id || id);

// ============================== Value ===============================
const mergedValue = defineModel('value', { default: '' });

// =============================== Open ===============================
const { open } = toRefs(useUnstableContextInject());

watch(
  measuring,
  () => {
    // Sync measure div top with textarea for rc-trigger usage
    if (measuring.value && measureRef.value) {
      measureRef.value.scrollTop = getTextArea().scrollTop;
    }
  },
  { immediate: true },
);

const { mergedMeasuring, mergedMeasureText, mergedMeasurePrefix, mergedMeasureLocation } = toRefs(
  reactiveComputed<{
    mergedMeasuring: typeof measuring.value;
    mergedMeasureText: typeof measureText.value;
    mergedMeasurePrefix: typeof measurePrefix.value;
    mergedMeasureLocation: typeof measureLocation.value;
  }>(() => {
    if (open?.value) {
      for (let i = 0; i < mergedPrefix.value.length; i += 1) {
        const curPrefix = mergedPrefix.value[i];
        const index = mergedValue.value.lastIndexOf(curPrefix);
        if (index >= 0) {
          return { mergedMeasuring: true, mergedMeasureText: '', mergedMeasurePrefix: curPrefix, mergedMeasureLocation: index };
        }
      }
    }

    return {
      mergedMeasuring: measuring.value,
      mergedMeasureText: measureText.value,
      mergedMeasurePrefix: measurePrefix.value,
      mergedMeasureLocation: measureLocation.value,
    };
  }),
);

// ============================== Option ==============================
const getOptions = (targetMeasureText: string) => {
  let list = [];
  if (options && options.length > 0) {
    list = options.map((item) => ({
      ...item,
      key: `${item?.key ?? item.value}-${uniqueKey.value}`,
    }));
  }
  return list.filter((option: OptionProps) => {
    /** Return all result if `filterOption` is false. */
    if (filterOption === false) {
      return true;
    }
    return filterOption(targetMeasureText, option);
  });
};

const mergedOptions = computed(() => getOptions(mergedMeasureText.value));

// ============================= Measure ==============================
// Mark that we will reset input selection to target position when user select option
const onSelectionEffect = useEffectState();

const startMeasure = (nextMeasureText: string, nextMeasurePrefix: string, nextMeasureLocation: number) => {
  measuring.value = true;
  measureText.value = nextMeasureText;
  measurePrefix.value = nextMeasurePrefix;
  measureLocation.value = nextMeasureLocation;
  activeIndex.value = 0;
};

const stopMeasure = (callback?: VoidFunction) => {
  measuring.value = false;
  measureLocation.value = 0;
  measureText.value = '';
  onSelectionEffect(callback);
};

// ============================== Change ==============================
const triggerChange = (nextValue: string) => {
  mergedValue.value = nextValue;
  onChange?.(nextValue);
};

const onInternalChange = ({ target: { value: nextValue } }) => {
  triggerChange(nextValue);
};

const selectOption = (option: OptionProps) => {
  const { value: mentionValue = '' } = option;
  const { text, selectionLocation } = replaceWithMeasure(mergedValue.value, {
    measureLocation: mergedMeasureLocation.value,
    targetText: mentionValue,
    prefix: mergedMeasurePrefix.value,
    selectionStart: getTextArea()?.selectionStart,
    split,
  });
  triggerChange(text);
  stopMeasure(() => {
    // We need restore the selection position
    setInputSelection(getTextArea(), selectionLocation);
  });

  onSelect?.(option, mergedMeasurePrefix.value);
};

// ============================= KeyEvent =============================
// Check if hit the measure keyword
const onInternalKeyDown = (event) => {
  const { which } = event;

  onKeydown?.(event);

  // Skip if not measuring
  if (!mergedMeasuring.value) {
    return;
  }

  if (which === KeyCode.UP || which === KeyCode.DOWN) {
    // Control arrow function
    const optionLen = mergedOptions.value.length;
    const offset = which === KeyCode.UP ? -1 : 1;
    const newActiveIndex = (activeIndex.value + offset + optionLen) % optionLen;
    activeIndex.value = newActiveIndex;
    event.preventDefault();
  } else if (which === KeyCode.ESC) {
    stopMeasure();
  } else if (which === KeyCode.ENTER) {
    // Measure hit
    event.preventDefault();
    // loading skip
    if (silent) {
      return;
    }

    if (!mergedOptions.value.length) {
      stopMeasure();
      return;
    }
    const option = mergedOptions.value[activeIndex.value];
    selectOption(option);
  }
};

/**
 * When to start measure:
 * 1. When user press `prefix`
 * 2. When measureText !== prevMeasureText
 *  - If measure hit
 *  - If measuring
 *
 * When to stop measure:
 * 1. Selection is out of range
 * 2. Contains `space`
 * 3. ESC or select one
 */
const onInternalKeyUp = (event) => {
  const { key, which } = event;
  const target = event.target as HTMLTextAreaElement;
  const selectionStartText = getBeforeSelectionText(target);
  const { location: measureIndex, prefix: nextMeasurePrefix } = getLastMeasureIndex(selectionStartText, mergedPrefix.value);

  // If the client implements an onKeyUp handler, call it
  onKeyup?.(event);

  // Skip if match the white key list
  if ([KeyCode.ESC, KeyCode.UP, KeyCode.DOWN, KeyCode.ENTER].indexOf(which) !== -1) {
    return;
  }

  if (measureIndex !== -1) {
    const nextMeasureText = selectionStartText.slice(measureIndex + nextMeasurePrefix.length);
    const validateMeasure: boolean = validateSearch(nextMeasureText, split);
    const matchOption = !!getOptions(nextMeasureText).length;

    if (validateMeasure) {
      // adding AltGraph also fort azert keyboard
      if (
        key === nextMeasurePrefix ||
        key === 'Shift' ||
        which === KeyCode.ALT ||
        key === 'AltGraph' ||
        mergedMeasuring ||
        (nextMeasureText !== mergedMeasureText.value && matchOption)
      ) {
        startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex);
      }
    } else if (mergedMeasuring.value) {
      // Stop if measureText is invalidate
      stopMeasure();
    }

    /**
     * We will trigger `onSearch` to developer since they may use for async update.
     * If met `space` means user finished searching.
     */
    if (onSearch && validateMeasure) {
      onSearch(nextMeasureText, nextMeasurePrefix);
    }
  } else if (mergedMeasuring.value) {
    stopMeasure();
  }
};

const onInternalPressEnter = (event) => {
  if (!mergedMeasuring.value && onPressEnter) {
    onPressEnter(event);
  }
};

// ============================ Focus Blur ============================
const focusRef = ref<number>();

const onInternalFocus = (event?: FocusEvent) => {
  window.clearTimeout(focusRef.value);
  if (!isFocus.value && event && onFocus) {
    onFocus(event);
  }
  isFocus.value = true;
};

const onInternalBlur = (event?: FocusEvent) => {
  focusRef.value = window.setTimeout(() => {
    isFocus.value = false;
    stopMeasure();
    onBlur?.(event);
  }, 0);
};

const onDropdownFocus = () => {
  onInternalFocus();
};

const onDropdownBlur = () => {
  onInternalBlur();
};

// ============================== Scroll ===============================
const onInternalPopupScroll = (event) => {
  onPopupScroll?.(event);
};

// ============================== Styles ==============================
const mergedStyles = computed(() => {
  const resizeStyle = styles?.textarea?.resize ?? style?.resize;
  const mergedTextareaStyle = { ...styles?.textarea };

  // Only add resize if it has a valid value, avoid setting undefined
  if (resizeStyle !== undefined) {
    mergedTextareaStyle.resize = resizeStyle;
  }

  return {
    ...styles,
    textarea: mergedTextareaStyle,
  };
});

const attrs = useAttrs() as TextareaHTMLAttributes;

const MentionNode = () => {
  return (
    <>
      <TextArea
        classNames={{ textarea: mentionClassNames?.textarea }}
        /**
         * Example:<Mentions style={{ resize: 'none' }} />.
         * If written this way, resizing here will become invalid.
         * The TextArea component code and found that the resize parameter in the style of the ResizeTextArea component is obtained from prop.style.
         * Just pass the resize attribute and leave everything else unchanged.
         */
        styles={mergedStyles.value}
        ref={textareaRef}
        value={mergedValue.value}
        {...(assign(restProps, attrs) as any)}
        rows={attrs.rows || 1}
        onChange={onInternalChange}
        onKeydown={onInternalKeyDown}
        onKeyup={onInternalKeyUp}
        onPressEnter={onInternalPressEnter}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
      />
      {mergedMeasuring.value && (
        <div ref={measureRef} class={`${prefixCls}-measure`}>
          {mergedValue?.value?.slice(0, mergedMeasureLocation?.value)}
          <MentionsContextProvider
            value={{
              notFoundContent,
              activeIndex: activeIndex.value,
              selectOption,
              onFocus: onDropdownFocus,
              onBlur: onDropdownBlur,
              onScroll: onInternalPopupScroll,
            }}
          >
            <KeywordTrigger
              prefixCls={prefixCls}
              transitionName={transitionName}
              placement={placement}
              direction={direction}
              options={mergedOptions?.value}
              visible
              getPopupContainer={getPopupContainer}
              popupClassName={clsx(popupClassName, mentionClassNames?.popup)}
              popupStyle={styles?.popup}
            >
              <span>{mergedMeasurePrefix.value}</span>
            </KeywordTrigger>
          </MentionsContextProvider>
          {mergedValue?.value?.slice(mergedMeasureLocation?.value + mergedMeasurePrefix?.value?.length)}
        </div>
      )}
    </>
  );
};
</script>
<template>
  <div v-if="!hasWrapper" :class="clsx(prefixCls, className)" :style="style" ref="containerRef">
    <MentionNode />
  </div>
  <MentionNode v-else />
</template>
