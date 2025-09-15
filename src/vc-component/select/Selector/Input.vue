<script lang="tsx" setup>
import { cloneVNode, computed, getCurrentInstance, toRefs, type VNode } from 'vue';
import { useBaseSelectContextInject } from '../hooks/useBaseProps';
import clsx from 'clsx';
import composeProps from '@/vc-util/composeProps';
import { falseToUndefined } from '@/vc-util/props';
import type { VueNode } from '@/vc-util/type';

interface InputProps {
  prefixCls: string;
  id: string;
  inputElement: VueNode;
  disabled: boolean;
  autofocus: boolean;
  autocomplete?: string;
  editable: boolean;
  activeDescendantId?: string;
  value: string;
  maxlength?: number;
  open: boolean;
  tabindex: number | undefined;
  /** Pass accessibility props to input */
  attrs: Record<string, unknown>;

  onKeydown: (e: KeyboardEvent) => void;
  onMousedown: (e: MouseEvent) => void;
  onInput: (e) => void;
  onPaste: (e: ClipboardEvent) => void;
  onBlur: (e: FocusEvent) => void;
  onCompositionstart: (e: CompositionEvent) => void;
  onCompositionend: (e: CompositionEvent) => void;
}

const { prefixCls, id, inputElement, autocomplete, editable, activeDescendantId, value, open, attrs, ...restProps } =
  defineProps<InputProps>();

const { classNames: contextClassNames, styles: contextStyles } = toRefs(useBaseSelectContextInject());

const inputNode = computed(() => (inputElement || <input />) as VNode);

const vm = getCurrentInstance();
const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
</script>
<template>
  <component
    :is="cloneVNode(inputNode, { ref: changeRef })"
    v-bind="{
      type: 'search',
      ...falseToUndefined(composeProps(restProps, inputNode?.props as any || {}, true)),
      // Override over origin props
      id,
      autocomplete: autocomplete || 'off',

      class: clsx(`${prefixCls}-selection-search-input`, inputNode.props || {}, contextClassNames?.input),

      role: 'combobox',
      'aria-expanded': open || false,
      'aria-haspopup': 'listbox',
      'aria-owns': `${id}_list`,
      'aria-autocomplete': 'list',
      'aria-controls': `${id}_list`,
      'aria-activedescendant': open ? activeDescendantId : undefined,
      ...attrs,
      value: editable ? value : '',
      readonly: !editable,
      unselectable: !editable ? 'on' : null,

      style: {
        ...(inputNode.props?.style || {}),
        opacity: editable ? null : 0,
        ...contextStyles?.input,
      },
    }"
  />
</template>
