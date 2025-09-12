<script lang="tsx" setup>
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import type { EditableConfig, Tab } from '../interface';
import { genDataNodeKey, getRemovable } from '../util';
import clsx from 'clsx';
import { Render } from '@/components';

export interface TabNodeProps {
  id: any;
  prefixCls: string;
  tab: Tab;
  active: boolean;
  focus: boolean;
  closable?: boolean;
  editable?: EditableConfig;
  onClick?: (e: MouseEvent | KeyboardEvent) => void;
  onResize?: (width: number, height: number, left: number, top: number) => void;
  renderWrapper?: (node: any) => any;
  removeAriaLabel?: string;
  tabCount: number;
  currentPosition: number;
  removeIcon?: any;
  onKeydown: (e: KeyboardEvent) => void;
  onMousedown: (e: MouseEvent) => void;
  onMouseup: (e: MouseEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
  style?: CSSProperties;
  class?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  id,
  active,
  focus,
  tab,
  closable,
  renderWrapper,
  removeAriaLabel,
  editable,
  onClick,
  onFocus,
  onBlur,
  onKeydown,
  onMousedown,
  onMouseup,
  style,
  class: className,
  tabCount,
  currentPosition,
} = defineProps<TabNodeProps>();

const { key, label, disabled, closeIcon, icon } = toRefs(tab);

const tabPrefix = computed(() => `${prefixCls}-tab`);

const removable = computed(() => getRemovable(closable, closeIcon?.value, editable, disabled?.value));

function onInternalClick(e: MouseEvent | KeyboardEvent) {
  if (disabled?.value) {
    return;
  }
  onClick(e);
}

function onRemoveTab(event: MouseEvent | KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
  editable.onEdit('remove', { key: key?.value, event });
}

const labelNode = () => (icon?.value && typeof label?.value === 'string' ? <span>{label?.value}</span> : label?.value);

const btnRef = ref<HTMLDivElement>(null);

watch(
  () => focus,
  () => {
    if (focus && btnRef.value) {
      btnRef.value.focus();
    }
  },
  { immediate: true },
);

const Node = () => (
  <div
    key={key.value}
    data-node-key={genDataNodeKey(key.value)}
    class={clsx(tabPrefix.value, className, {
      [`${tabPrefix.value}-with-remove`]: removable.value,
      [`${tabPrefix.value}-active`]: active,
      [`${tabPrefix.value}-disabled`]: disabled?.value,
      [`${tabPrefix.value}-focus`]: focus,
    })}
    style={style}
    onClick={onInternalClick}
  >
    {/* Primary Tab Button */}
    <div
      ref={btnRef}
      role="tab"
      aria-selected={active}
      id={id && `${id}-tab-${key.value}`}
      class={`${tabPrefix.value}-btn`}
      aria-controls={id && `${id}-panel-${key.value}`}
      aria-disabled={disabled?.value}
      tabindex={disabled?.value ? null : active ? 0 : -1}
      onClick={(e) => {
        e.stopPropagation();
        onInternalClick(e);
      }}
      onKeydown={onKeydown}
      onMousedown={onMousedown}
      onMouseup={onMouseup}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {focus && (
        <div aria-live="polite" style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }}>
          {`Tab ${currentPosition} of ${tabCount}`}
        </div>
      )}
      {icon?.value && <span class={`${tabPrefix.value}-icon`}>{icon.value}</span>}
      {label?.value && <Render content={labelNode}></Render>}
    </div>

    {/* Remove Button */}
    {removable.value && (
      <button
        type="button"
        aria-label={removeAriaLabel || 'remove'}
        tabindex={active ? 0 : -1}
        class={`${tabPrefix.value}-remove`}
        onClick={(e) => {
          e.stopPropagation();
          onRemoveTab(e);
        }}
      >
        {closeIcon?.value || editable?.removeIcon || '×'}
      </button>
    )}
  </div>
);
</script>
<template>
  <template v-if="renderWrapper">
    <Render :content="renderWrapper(Node())" />
  </template>
  <Node v-else />
</template>
