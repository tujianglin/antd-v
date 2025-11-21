<script lang="tsx" setup>
import { clsx } from 'clsx';
import type { DisplayValueType, RawValueType } from '../../interface';
import type { CustomTagProps } from '../../BaseSelect/interface';
import TransBtn from '../../TransBtn.vue';
import { getTitle } from '../../utils/commonUtil';
import { useSelectInputContextInject } from '../context';
import { computed, getCurrentInstance, h, toRefs } from 'vue';
import type { VueNode } from '@/vc-util/type';
import Overflow from '@/vc-component/overflow';
import Input from '../Input.vue';
import type { SharedContentProps } from './index.vue';
import { useBaseSelectContextInject } from '../../hooks/useBaseProps';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { inputProps } = defineProps<SharedContentProps>();

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value;
}

const onPreventMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const {
  prefixCls,
  displayValues,
  searchValue,
  mode,
  onSelectorRemove,
  removeIcon: removeIconFromContext,
} = toRefs(useSelectInputContextInject());
const {
  disabled,
  showSearch,
  triggerOpen,
  toggleOpen,
  autoClearSearchValue,
  tagRender: tagRenderFromContext,
  maxTagPlaceholder: maxTagPlaceholderFromContext,
  maxTagTextLength,
  maxTagCount,
  classNames,
  styles,
} = toRefs(useBaseSelectContextInject());

const selectionItemPrefixCls = computed(() => `${prefixCls.value}-selection-item`);

// ===================== Search ======================
// Apply autoClearSearchValue logic: when dropdown is closed and autoClearSearchValue is not false (default true), clear search value
const computedSearchValue = computed(() => {
  let result = searchValue?.value;
  if (!triggerOpen?.value && mode?.value === 'multiple' && autoClearSearchValue?.value !== false) {
    result = '';
  }
  return result;
});

const inputValue = computed(() => (showSearch.value ? computedSearchValue.value || '' : ''));
const inputEditable = computed<boolean>(() => (showSearch.value && !disabled.value) as boolean);

// Props from context with safe defaults
const removeIcon = computed(() => removeIconFromContext.value ?? '×');
const maxTagPlaceholder = computed<VueNode | ((omittedValues: DisplayValueType[]) => VueNode)>(
  () => maxTagPlaceholderFromContext.value ?? ((omittedValues: DisplayValueType[]) => `+ ${omittedValues.length} ...`),
);
const tagRender = computed<((props: CustomTagProps) => VueNode) | undefined>(() => tagRenderFromContext.value);

const onToggleOpen = (newOpen?: boolean) => {
  toggleOpen?.value?.(newOpen);
};

const onRemove = (value: DisplayValueType) => {
  onSelectorRemove?.value?.(value);
};

// ======================== Item ========================
// >>> Render Selector Node. Includes Item & Rest
const defaultRenderSelector = (
  item: DisplayValueType,
  content: VueNode,
  itemDisabled: boolean,
  closable?: boolean,
  onClose?: (e: MouseEvent) => void,
) => (
  <span
    title={getTitle(item)}
    class={clsx(
      selectionItemPrefixCls.value,
      {
        [`${selectionItemPrefixCls.value}-disabled`]: itemDisabled,
      },
      classNames.value?.item,
    )}
    style={styles.value?.item}
  >
    <span
      class={clsx(`${selectionItemPrefixCls.value}-content`, classNames.value?.itemContent)}
      style={styles.value?.itemContent}
    >
      {content}
    </span>
    {closable && (
      <TransBtn
        class={clsx(`${selectionItemPrefixCls.value}-remove`, classNames.value?.itemRemove)}
        style={styles.value?.itemRemove}
        onMousedown={onPreventMouseDown}
        onClick={onClose}
        customizeIcon={removeIcon.value}
      >
        ×
      </TransBtn>
    )}
  </span>
);

const customizeRenderSelector = (
  value: RawValueType,
  content: VueNode,
  itemDisabled: boolean,
  closable?: boolean,
  onClose?: (e: MouseEvent) => void,
  isMaxTag?: boolean,
  info?: { index: number },
) => {
  const onMouseDown = (e: MouseEvent) => {
    onPreventMouseDown(e);
    onToggleOpen(!triggerOpen?.value);
  };
  return (
    <span onMousedown={onMouseDown}>
      {tagRender.value({
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

// ====================== Overflow ======================
const renderItem = (valueItem: DisplayValueType, info: { index: number }) => {
  const { disabled: itemDisabled, label, value } = valueItem;
  const closable = !disabled.value && !itemDisabled;

  let displayLabel: VueNode = label;

  if (typeof maxTagTextLength.value === 'number') {
    if (typeof label === 'string' || typeof label === 'number') {
      const strLabel = String(displayLabel);
      if (strLabel.length > maxTagTextLength.value) {
        displayLabel = `${strLabel.slice(0, maxTagTextLength.value)}...`;
      }
    }
  }

  const onClose = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    onRemove(valueItem);
  };

  return typeof tagRender.value === 'function'
    ? customizeRenderSelector(value, displayLabel, itemDisabled, closable, onClose, undefined, info)
    : defaultRenderSelector(valueItem, displayLabel, itemDisabled, closable, onClose);
};

const renderRest = (omittedValues: DisplayValueType[]) => {
  // https://github.com/ant-design/ant-design/issues/48930
  if (!displayValues.value.length) {
    return null;
  }
  const content =
    typeof maxTagPlaceholder.value === 'function' ? (maxTagPlaceholder.value as any)(omittedValues) : maxTagPlaceholder;
  return typeof tagRender.value === 'function'
    ? customizeRenderSelector(undefined, content, false, false, undefined, true)
    : defaultRenderSelector({ title: content }, content, false);
};

const vm = getCurrentInstance();

const changeRef = (el) => {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
};
</script>
<template>
  <Overflow
    :prefix-cls="`${prefixCls}-content`"
    :class="classNames?.content"
    :style="styles?.content"
    :data="displayValues"
    :render-item="renderItem"
    :render-rest="renderRest"
    :suffix="
      // @ts-ignore 111
      h(Input, { ref: changeRef, disabled, readonly: !inputEditable, ...inputProps, value: inputValue || '', syncWidth: true })
    "
    :item-key="itemKey"
    :max-count="maxTagCount"
  />
</template>
