<script lang="tsx" setup>
import { computed, onMounted, ref, useAttrs, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { DirectionType } from '../config-provider';
import TextArea, { type TextAreaProps } from '../input/TextArea.vue';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import { EnterOutlined } from '@ant-design/icons-vue';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import { cloneElement } from '@/vc-util/Children/util';

interface EditableProps {
  prefixCls: string;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onEnd?: () => void;
  class?: string;
  style?: CSSProperties;
  direction?: DirectionType;
  maxlength?: number;
  autoSize?: TextAreaProps['autoSize'];
  enterIcon?: VueNode;
  component?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  class: className,
  style,
  direction,
  maxlength,
  autoSize = true,
  value,
  onSave,
  onCancel,
  onEnd,
  component,
  enterIcon = <EnterOutlined />,
} = defineProps<EditableProps>();

const attrs = useAttrs();
const ariaLabel = computed<string>(() => (attrs.ariaLabel as string) || '');

const dom = useTemplateRef('textAreaRef');

const inComposition = ref(false);
const lastKeyCode = ref<number>(null);

const current = ref(value);

watch(
  () => value,
  () => {
    current.value = value;
  },
  { immediate: true },
);

onMounted(() => {
  if (dom.value?.resizableTextArea) {
    const { textArea } = dom.value.resizableTextArea;
    textArea.focus();
    const { length } = textArea.value;
    textArea.setSelectionRange(length, length);
  }
});

const onChange = ({ target }) => {
  current.value = target.value.replace(/[\n\r]/g, '');
};

const onCompositionstart = () => {
  inComposition.value = true;
};

const onCompositionend = () => {
  inComposition.value = false;
};

const onKeydown = ({ keyCode }) => {
  // We don't record keyCode when IME is using
  if (inComposition.value) return;

  lastKeyCode.value = keyCode;
};

const confirmChange = () => {
  onSave(current.value.trim());
};

const onKeyup = ({ keyCode, ctrlKey, altKey, metaKey, shiftKey }: KeyboardEvent) => {
  // Check if it's a real key
  if (lastKeyCode.value !== keyCode || inComposition.value || ctrlKey || altKey || metaKey || shiftKey) {
    return;
  }
  if (keyCode === KeyCode.ENTER) {
    confirmChange();
    onEnd?.();
  } else if (keyCode === KeyCode.ESC) {
    onCancel();
  }
};

const onBlur = () => {
  confirmChange();
};

const [, hashId] = useStyle(computed(() => prefixCls));

const textAreaClassName = computed(() =>
  clsx(
    prefixCls,
    `${prefixCls}-edit-content`,
    {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-${component}`]: !!component,
    },
    className,
    hashId.value,
  ),
);
</script>
<template>
  <div :class="textAreaClassName" :style="style">
    <TextArea
      ref="textAreaRef"
      :maxlength="maxlength"
      :value="current"
      @change="onChange"
      @keydown="onKeydown"
      @keyup="onKeyup"
      @compositionstart="onCompositionstart"
      @compositionend="onCompositionend"
      @blur="onBlur"
      :aria-label="ariaLabel"
      :rows="1"
      :auto-size="autoSize"
    />
    <component v-if="enterIcon !== null" :is="cloneElement(enterIcon, { class: `${prefixCls}-edit-content-confirm` })" />
  </div>
</template>
