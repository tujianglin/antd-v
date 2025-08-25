<script lang="tsx" setup>
import type { RenderNode } from '@/components/_util/type';
import { computed, getCurrentInstance, ref, watch } from 'vue';
import type { InnerSelectorProps } from './interface';
import { getTitle } from '../utils/commonUtil';
import Input from './Input.vue';
import pickAttrs from '@/vc-util/pickAttrs';
import { Render } from '@/components';
interface SelectorProps extends InnerSelectorProps {
  inputElement: RenderNode;
  activeValue: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  inputElement,
  prefixCls,
  id,
  disabled,
  autofocus,
  autocomplete,
  activeDescendantId,
  mode,
  open,
  values = [],
  placeholder,
  tabindex,

  showSearch,
  searchValue,
  activeValue,
  maxlength,

  onInputKeyDown,
  onInputMouseDown,
  onInputChange,
  onInputPaste,
  onInputCompositionStart,
  onInputCompositionEnd,
  onInputBlur,
  title,
} = defineProps<SelectorProps>();

const inputChanged = ref(false);

const combobox = computed(() => mode === 'combobox');
const inputEditable = computed(() => combobox.value || showSearch);
const item = computed(() => values[0]);

const inputValue = computed(() => {
  let result = searchValue || '';
  if (combobox.value && activeValue && !inputChanged.value) {
    result = activeValue;
  }
  return result;
});

watch(
  [() => combobox.value, () => activeValue],
  () => {
    if (combobox.value) {
      inputChanged.value = false;
    }
  },
  { immediate: true },
);

// Not show text when closed expect combobox mode
const hasTextInput = computed(() => (mode !== 'combobox' && !open && !showSearch ? false : !!inputValue.value));

// Get title of selection item
const selectionTitle = computed(() => (title === undefined ? getTitle(item.value) : title));

const placeholderNode = computed(() => {
  if (item.value) {
    return null;
  }
  return (
    <span class={`${prefixCls}-selection-placeholder`} style={hasTextInput.value ? { visibility: 'hidden' } : undefined}>
      {placeholder}
    </span>
  );
});

const vm = getCurrentInstance();

const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
</script>
<template>
  <span :class="`${prefixCls}-selection-wrap`">
    <span :class="`${prefixCls}-selection-search`">
      <Input
        :ref="changeRef"
        :prefix-cls="prefixCls"
        :id="id"
        :open="open"
        :input-element="inputElement"
        :disabled="disabled"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :editable="inputEditable"
        :active-descendant-id="activeDescendantId"
        :value="inputValue"
        @keydown="onInputKeyDown"
        @mousedown="onInputMouseDown"
        @input="
          (e) => {
            inputChanged = true;
            onInputChange(e);
          }
        "
        @paste="onInputPaste"
        @compositionstart="onInputCompositionStart"
        @compositionend="onInputCompositionEnd"
        @blur="onInputBlur"
        :tabindex="tabindex"
        :attrs="pickAttrs($props, true)"
        :maxlength="combobox ? maxlength : undefined"
      />
    </span>
    <span
      v-if="!combobox && item"
      :class="`${prefixCls}-selection-item`"
      :title="selectionTitle"
      :style="hasTextInput ? { visibility: 'hidden' } : undefined"
    >
      <Render :content="item.label" />
    </span>
    <Render :content="placeholderNode" />
  </span>
</template>
