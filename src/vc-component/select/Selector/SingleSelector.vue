<script lang="tsx" setup>
import Render from '@/vc-component/render';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { getTitle } from '../utils/commonUtil';
import Input from './Input.vue';
import type { InnerSelectorProps } from './interface';
interface SelectorProps extends InnerSelectorProps {
  inputElement: VueNode;
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
    <span v-if="!item" :class="`${prefixCls}-selection-placeholder`" :style="hasTextInput ? { visibility: 'hidden' } : undefined">
      <Render :content="placeholder" />
    </span>
  </span>
</template>
