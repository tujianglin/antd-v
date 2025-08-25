<script lang="tsx" setup>
import type { RenderNode } from '@/components/_util/type';
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';
import type { CustomTagProps } from '../BaseSelect/interface';
import type { DisplayValueType, RawValueType } from '../interface';
import type { InnerSelectorProps } from './interface';
import { getTitle } from '../utils/commonUtil';
import clsx from 'clsx';
import TransBtn from '../TransBtn.vue';
import Input from './Input.vue';
import pickAttrs from '@/vc-util/pickAttrs';
import Overflow from '@/vc-component/overflow';
import { Render } from '@/components';

interface SelectorProps extends InnerSelectorProps {
  // Icon
  removeIcon?: RenderNode;

  // Tags
  maxTagCount?: number | 'responsive';
  maxTagTextLength?: number;
  maxTagPlaceholder?: any | ((omittedValues: DisplayValueType[]) => any);
  tokenSeparators?: string[];
  tagRender?: (props: CustomTagProps) => RenderNode;
  onToggleOpen: (open?: boolean) => void;

  // Motion
  choiceTransitionName?: string;

  // Event
  onRemove: (value: DisplayValueType) => void;
}

defineOptions({ name: 'MultipleSelector', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,
  prefixCls,

  values,
  open,
  searchValue,
  autoClearSearchValue,
  placeholder,
  disabled,
  mode,
  showSearch,
  autofocus,
  autocomplete,
  activeDescendantId,
  tabindex,

  removeIcon,

  maxTagCount,
  maxTagTextLength,
  maxTagPlaceholder = (omittedValues: DisplayValueType[]) => `+ ${omittedValues.length} ...`,
  tagRender,
  onToggleOpen,

  onRemove,
  onInputChange,
  onInputPaste,
  onInputKeyDown,
  onInputMouseDown,
  onInputCompositionStart,
  onInputCompositionEnd,
  onInputBlur,
} = defineProps<SelectorProps>();

const measureRef = ref<HTMLSpanElement>(null);
const inputWidth = ref(0);
const focused = ref(false);

const selectionPrefixCls = `${prefixCls}-selection`;

// ===================== Search ======================
const inputValue = computed(() =>
  open || (mode === 'multiple' && autoClearSearchValue === false) || mode === 'tags' ? searchValue : '',
);
const inputEditable = computed(
  (): boolean =>
    mode === 'tags' || (mode === 'multiple' && autoClearSearchValue === false) || (showSearch && (open || focused.value)),
);

// We measure width and set to the input immediately
watch(
  [() => inputValue.value],
  async () => {
    await nextTick();
    inputWidth.value = measureRef.value.scrollWidth;
  },
  { flush: 'post', immediate: true },
);

// ===================== Render ======================
const onPreventMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

// >>> Render Selector Node. Includes Item & Rest
const defaultRenderSelector = (
  item: DisplayValueType,
  content: RenderNode,
  itemDisabled: boolean,
  closable?: boolean,
  onClose?: (e: MouseEvent) => void,
) => (
  <span
    title={getTitle(item)}
    class={clsx(`${selectionPrefixCls}-item`, {
      [`${selectionPrefixCls}-item-disabled`]: itemDisabled,
    })}
  >
    <span class={`${selectionPrefixCls}-item-content`}>{content}</span>
    {closable && (
      <TransBtn
        class={`${selectionPrefixCls}-item-remove`}
        onMousedown={onPreventMouseDown}
        onClick={onClose}
        customizeIcon={removeIcon}
      >
        ×
      </TransBtn>
    )}
  </span>
);

const customizeRenderSelector = (
  value: RawValueType,
  content: RenderNode,
  itemDisabled: boolean,
  closable?: boolean,
  onClose?: (e: MouseEvent) => void,
  isMaxTag?: boolean,
  info?: { index: number },
) => {
  const onMouseDown = (e: MouseEvent) => {
    onPreventMouseDown(e);
    onToggleOpen(!open);
  };
  return (
    <span onMousedown={onMouseDown}>
      {tagRender({
        label: content,
        value,
        index: info?.index,
        disabled: itemDisabled,
        closable,
        onClose,
        isMaxTag: !!isMaxTag,
      })}
    </span>
  );
};

const renderItem = (valueItem: DisplayValueType, info: { index: number }) => {
  const { disabled: itemDisabled, label, value } = valueItem;
  const closable = !disabled && !itemDisabled;

  let displayLabel: any = label;

  if (typeof maxTagTextLength === 'number') {
    if (typeof label === 'string' || typeof label === 'number') {
      const strLabel = String(displayLabel);
      if (strLabel.length > maxTagTextLength) {
        displayLabel = `${strLabel.slice(0, maxTagTextLength)}...`;
      }
    }
  }

  const onClose = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    onRemove(valueItem);
  };

  return typeof tagRender === 'function'
    ? customizeRenderSelector(value, displayLabel, itemDisabled, closable, onClose, undefined, info)
    : defaultRenderSelector(valueItem, displayLabel, itemDisabled, closable, onClose);
};

const renderRest = (omittedValues: DisplayValueType[]) => {
  // https://github.com/ant-design/ant-design/issues/48930
  if (!values.length) {
    return null;
  }
  const content = typeof maxTagPlaceholder === 'function' ? maxTagPlaceholder(omittedValues) : maxTagPlaceholder;
  return typeof tagRender === 'function'
    ? customizeRenderSelector(undefined, content, false, false, undefined, true)
    : defaultRenderSelector({ title: content }, content, false);
};

const vm = getCurrentInstance();

const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
// >>> Input Node
const inputNode = () => (
  <div
    class={`${selectionPrefixCls}-search`}
    style={{ width: `${inputWidth.value}px` }}
    onFocus={() => {
      focused.value = true;
    }}
    onBlur={() => {
      focused.value = false;
    }}
  >
    <Input
      ref={changeRef}
      open={open}
      prefixCls={prefixCls}
      id={id}
      inputElement={null}
      disabled={disabled}
      autofocus={autofocus}
      autocomplete={autocomplete}
      editable={inputEditable.value}
      activeDescendantId={activeDescendantId}
      value={inputValue.value}
      onKeydown={onInputKeyDown}
      onMousedown={onInputMouseDown}
      onInput={onInputChange}
      onPaste={onInputPaste}
      onCompositionstart={onInputCompositionStart}
      onCompositionend={onInputCompositionEnd}
      onBlur={onInputBlur}
      tabindex={tabindex}
      attrs={pickAttrs(vm.props, true)}
    />

    {/* Measure Node */}
    <span ref={measureRef} class={`${selectionPrefixCls}-search-mirror`} aria-hidden>
      {inputValue.value}&nbsp;
    </span>
  </div>
);

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value;
}

// >>> Selections
const selectionNode = () => (
  <Overflow
    prefixCls={`${selectionPrefixCls}-overflow`}
    data={values}
    renderItem={renderItem}
    renderRest={renderRest}
    suffix={inputNode}
    itemKey={itemKey}
    maxCount={maxTagCount}
  />
);
</script>
<template>
  <span :class="`${selectionPrefixCls}-wrap`">
    <Render :content="selectionNode" />
    <span v-if="!values.length && !inputValue" :class="`${selectionPrefixCls}-placeholder`">
      <Render :content="placeholder" />
    </span>
  </span>
</template>
