<script lang="tsx" setup generic="DateType extends object = any">
import { computed } from 'vue';
import type { PickerProps } from '../../SinglePicker.vue';
import clsx from 'clsx';
import { Render } from '@/components';
import Overflow from '@/vc-component/overflow';

export interface MultipleDatesProps<DateType extends object = any> extends Pick<PickerProps, 'maxTagCount'> {
  prefixCls: string;
  value: DateType[];
  onRemove: (value: DateType) => void;
  removeIcon?: any;
  formatDate: (date: DateType) => string;
  disabled?: boolean;
  placeholder?: any;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  value,
  onRemove,
  removeIcon = '×',
  formatDate,
  disabled,
  maxTagCount,
  placeholder,
} = defineProps<MultipleDatesProps<DateType>>();

const selectorCls = computed(() => `${prefixCls}-selector`);
const selectionCls = computed(() => `${prefixCls}-selection`);
const overflowCls = computed(() => `${selectionCls.value}-overflow`);

// ========================= Item =========================
function renderSelector(content: any, onClose?: (e: MouseEvent) => void) {
  return (
    <span class={clsx(`${selectionCls.value}-item`)} title={typeof content === 'string' ? content : null}>
      <span class={`${selectionCls.value}-item-content`}>{content}</span>
      {!disabled && onClose && (
        <span
          onMousedown={(e) => {
            e.preventDefault();
          }}
          onClick={onClose}
          class={`${selectionCls.value}-item-remove`}
        >
          <Render content={removeIcon}></Render>
        </span>
      )}
    </span>
  );
}

function renderItem(date: DateType) {
  const displayLabel: any = formatDate(date);

  const onClose = (event?: MouseEvent) => {
    if (event) event.stopPropagation();
    onRemove(date);
  };

  return renderSelector(displayLabel, onClose);
}

// ========================= Rest =========================
function renderRest(omittedValues: DateType[]) {
  const content = `+ ${omittedValues.length} ...`;

  return renderSelector(content);
}
</script>
<template>
  <div :class="selectorCls">
    <Overflow
      :prefix-cls="overflowCls"
      :data="value"
      :render-item="renderItem"
      :render-rest="renderRest"
      :item-key="(date) => formatDate(date)"
      :max-count="maxTagCount"
    />
    <span v-if="!value.length" :class="`${prefixCls}-selection-placeholder`">
      <Render :content="placeholder" />
    </span>
  </div>
</template>
