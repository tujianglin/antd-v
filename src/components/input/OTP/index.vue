<script lang="tsx" setup>
import { useEvent } from '@/vc-util/hooks/useEvent';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { computed, ref, toRefs, watch } from 'vue';
import type { InputRef } from '..';
import useMergeSemantic from '../../_util/hooks/useMergeSemantic';
import { useComponentConfig } from '../../config-provider/context';
import useSize from '../../config-provider/hooks/useSize';
import useStyle from '../style/otp';
import type { OTPProps } from './interface';
import type { OTPInputProps } from './OTPInput.vue';
import OTPInput from './OTPInput.vue';
import Separator from './Separator.vue';

const {
  prefixCls: customizePrefixCls,
  length = 6,
  size: customSize,
  onChange,
  formatter,
  separator,
  variant,
  disabled,
  autofocus,
  mask,
  type,
  onInput,
  inputmode,
  classNames,
  styles,
  class: className,
  style,
  ...restProps
} = defineProps<OTPProps>();

const value = defineModel<string>('value');

const {
  classNames: contextClassNames,
  styles: contextStyles,
  getPrefixCls,
  direction,
  style: contextStyle,
  class: contextClassName,
} = toRefs(useComponentConfig('otp'));

const prefixCls = getPrefixCls.value('otp', customizePrefixCls);

const { mergedClassNames, mergedStyles } = toRefs(
  useMergeSemantic(
    computed(() => [contextClassNames.value, classNames]),
    computed(() => [contextStyles.value, styles]),
  ),
);

const domAttrs = computed(() =>
  pickAttrs(restProps, {
    aria: true,
    data: true,
    attr: true,
  }),
);

const [hashId, cssVarCls] = useStyle(prefixCls);

const mergedSize = computed(() => useSize((ctx) => customSize ?? ctx));

const containerRef = ref<HTMLDivElement>(null);
const refs = ref<Record<number, InputRef | null>>({});

const internalFormatter = computed(() => (txt: string) => (formatter ? formatter(txt) : txt));

const valueCells = ref<string[]>([]);

function strToArr(str: string) {
  return (str || '').split('');
}

watch(
  () => value.value,
  (val) => {
    if (val !== undefined) {
      valueCells.value = strToArr(val);
    }
  },
  { immediate: true },
);

const triggerValueCellsChange = useEvent((nextValueCells: string[]) => {
  valueCells.value = nextValueCells;
  if (onInput) {
    onInput(nextValueCells);
  }
  // Trigger if all cells are filled
  if (
    onChange &&
    nextValueCells.length === length &&
    nextValueCells.every((c) => c) &&
    nextValueCells.some((c, index) => valueCells[index] !== c)
  ) {
    onChange(nextValueCells.join(''));
  }
});

const patchValue = useEvent((index: number, txt: string) => {
  let nextCells = [...valueCells.value];
  // Fill cells till index
  for (let i = 0; i < index; i += 1) {
    if (!nextCells[i]) {
      nextCells[i] = '';
    }
  }
  if (txt.length <= 1) {
    nextCells[index] = txt;
  } else {
    nextCells = nextCells.slice(0, index).concat(strToArr(txt));
  }
  nextCells = nextCells.slice(0, length);

  // Clean the last empty cell
  for (let i = nextCells.length - 1; i >= 0; i -= 1) {
    if (nextCells[i]) {
      break;
    }
    nextCells.pop();
  }
  // Format if needed
  const formattedValue = internalFormatter.value(nextCells.map((c) => c || ' ').join(''));
  nextCells = strToArr(formattedValue).map((c, i) => {
    if (c === ' ' && !nextCells[i]) {
      return nextCells[i];
    }
    return c;
  });
  return nextCells;
});

// ======================== Change ========================
function onInputChange(index, txt) {
  const nextCells = patchValue(index, txt);

  const nextIndex = Math.min(index + txt.length, length - 1);
  if (nextIndex !== index && nextCells[index] !== undefined) {
    refs.value[nextIndex]?.focus();
  }
  triggerValueCellsChange(nextCells);
}

function onInputActiveChange(nextIndex) {
  refs.value[nextIndex]?.focus();
}

const inputSharedProps = computed(
  (): Partial<OTPInputProps> => ({
    variant,
    disabled,
    mask,
    type,
    inputmode,
  }),
);

defineExpose({
  focus: () => {
    refs.value[0]?.focus();
  },
  blur: () => {
    for (let i = 0; i < length; i += 1) {
      refs.value[i]?.blur();
    }
  },
  nativeElement: containerRef.value,
});
</script>

<template>
  <div
    v-bind="domAttrs"
    ref="containerRef"
    :class="
      clsx(
        className,
        prefixCls,
        {
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-lg`]: mergedSize === 'large',
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        cssVarCls,
        hashId,
        contextClassName,
        mergedClassNames.root,
      )
    "
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    role="group"
  >
    <template v-for="(_, index) in Array.from({ length })" :key="index">
      <OTPInput
        :ref="
          (inputEle) => {
            refs[index] = inputEle as any;
          }
        "
        :index="index"
        :size="mergedSize"
        :html-size="1"
        :class="clsx(mergedClassNames.input, `${prefixCls}-input`)"
        :style="mergedStyles.input"
        @change="onInputChange"
        v-model:value="valueCells[index]"
        @active-change="onInputActiveChange"
        :autofocus="index === 0 && autofocus"
        v-bind="inputSharedProps"
      />
      <Separator
        v-if="index < length - 1"
        :separator="separator"
        :index="index"
        :prefix-cls="prefixCls"
        :class="clsx(mergedClassNames.separator)"
        :style="mergedStyles.separator"
      />
    </template>
  </div>
</template>
