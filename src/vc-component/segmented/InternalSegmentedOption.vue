<script lang="tsx" setup>
import { type CSSProperties } from 'vue';
import type { ItemRender, SegmentedLabeledOption, SegmentedRawOption, SemanticName } from './index.vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';

interface Props {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  data: SegmentedLabeledOption;
  disabled?: boolean;
  checked: boolean;
  label: any;
  title?: string;
  value: SegmentedRawOption;
  name?: string;
  onChange: (e, value: SegmentedRawOption) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e?: FocusEvent) => void;
  onKeydown: (e: KeyboardEvent) => void;
  onKeyup: (e: KeyboardEvent) => void;
  onMousedown: () => void;
  itemRender?: ItemRender;
}
const {
  prefixCls,
  class: className,
  style,
  styles,
  classNames: segmentedClassNames,
  data,
  disabled,
  checked,
  label,
  title,
  value,
  name,
  onChange,
  onFocus,
  onBlur,
  onKeydown,
  onKeyup,
  onMousedown,
  itemRender = (node: any) => node,
} = defineProps<Props>();
const handleChange = (event) => {
  if (disabled) {
    return;
  }
  onChange(event, value);
};

const itemContent = () => (
  <label
    class={clsx(className, {
      [`${prefixCls}-item-disabled`]: disabled,
    })}
    style={style}
    onMousedown={onMousedown}
  >
    <input
      name={name}
      class={`${prefixCls}-item-input`}
      type="radio"
      disabled={disabled}
      checked={checked}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeydown={onKeydown}
      onKeyup={onKeyup}
    />
    <div class={clsx(`${prefixCls}-item-label`, segmentedClassNames?.label)} title={title} style={styles?.label}>
      <Render content={label}></Render>
    </div>
  </label>
);
</script>
<template>
  <Render :content="itemRender(itemContent(), { item: data })" />
</template>
