<script lang="tsx" setup>
import { cloneVNode, computed, getCurrentInstance, ref, toRefs, useTemplateRef, type CSSProperties, type VNode } from 'vue';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import type { InputProps } from './interface';
import Input from './Input.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import Button from '../button';
import Render from '@/vc-component/render';
import clsx from 'clsx';
import type { ButtonSemanticName } from '../button/interface';
import type { ValueType } from '@/vc-component/input/interface';
import type { VueNode } from '@/vc-util/type';

type SemanticName = 'root' | 'input' | 'prefix' | 'suffix' | 'count';

export type InputSearchClassNamesType = SemanticClassNamesType<SearchProps, SemanticName> & {
  button?: SemanticClassNames<ButtonSemanticName>;
};

export type InputSearchStylesType = SemanticStylesType<SearchProps, SemanticName> & {
  button?: SemanticStyles<ButtonSemanticName>;
};

export interface SearchProps extends InputProps {
  inputPrefixCls?: string;
  enterButton?: VueNode | boolean;
  loading?: boolean;
  onPressEnter?: (e: KeyboardEvent) => void;
  classNames?: Partial<Record<SemanticName, string>> & {
    button?: Partial<Record<ButtonSemanticName, string>>;
  };
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    button?: Partial<Record<ButtonSemanticName, CSSProperties>>;
  };
}

defineOptions({ name: 'InputSearch', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  inputPrefixCls: customizeInputPrefixCls,
  class: className,
  size: customizeSize,
  suffix,
  enterButton = false,
  addonAfter,
  loading,
  disabled,
  variant,
  onPressEnter: customOnPressEnter,
  classNames,
  styles,
  ...restProps
} = defineProps<SearchProps>();

const emits = defineEmits<{
  search: [string, MouseEvent | KeyboardEvent, { source?: 'clear' | 'input' }];
  change: [any];
  compositionstart: [CompositionEvent];
  compositionend: [CompositionEvent];
}>();

const slots = defineSlots<{ suffix?: () => VNode[]; addonAfter?: () => VNode[]; enterButton?: () => VNode[] }>();

const value = defineModel<ValueType>('value');

const suffixSlot = computed(() => slots.suffix || suffix);
const addonAfterSlot = computed(() => slots.addonAfter || addonAfter);
const enterButtonSlot = computed(() => slots.enterButton || enterButton);

const {
  direction,
  getPrefixCls,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('inputSearch'));

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<InputSearchClassNamesType, InputSearchStylesType, SearchProps>(
  computed(() => [contextClassNames.value, classNames]),
  computed(() => [contextStyles.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      enterButton,
    },
  })),
  computed(() => ({
    button: {
      _default: 'root',
    },
  })),
);

const prefixCls = computed(() => getPrefixCls.value('input-search', customizePrefixCls));
const inputPrefix = computed(() => getPrefixCls.value('input', customizeInputPrefixCls));
const { compactSize } = useCompactItemContext(prefixCls, direction);

const size = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

const inputRef = useTemplateRef('inputRef');
const composedRef = ref(false);

function onChange(e: Event) {
  if (e?.target && e.type === 'click') {
    emits('search', (e.target as HTMLInputElement).value, e as MouseEvent, {
      source: 'clear',
    });
  }
  emits('change', e);
}

function onMouseDown(e: MouseEvent) {
  if (document.activeElement === inputRef.value?.input) {
    e.preventDefault();
  }
}

function handleSearch(e: MouseEvent | KeyboardEvent) {
  emits('search', inputRef.value.input.value, e, {
    source: 'input',
  });
}

function handlePressEnter(e: KeyboardEvent) {
  if (composedRef.value || loading) {
    return;
  }
  customOnPressEnter?.(e);
  handleSearch(e);
}

const searchIcon = computed(() => (typeof enterButton === 'boolean' ? <SearchOutlined /> : null));
const btnClassName = computed(() => clsx(`${prefixCls.value}-button`, mergedClassNames?.value?.button?.root));

const button = computed(() => {
  let button;
  const enterButtonAsElement = (enterButton || {}) as VNode;
  const isAntdButton = enterButtonAsElement.type && (enterButtonAsElement.type as typeof Button).name === 'Button';
  if (isAntdButton) {
    button = cloneVNode(enterButtonAsElement, {
      onMousedown: onMouseDown,
      onClick: (e: MouseEvent) => {
        enterButtonAsElement?.props?.onClick?.(e);
        handleSearch(e);
      },
      key: 'enterButton',
      ...(isAntdButton
        ? {
            class: btnClassName.value,
            size: size.value,
          }
        : {}),
    });
  } else {
    button = (
      <Button
        classNames={mergedClassNames.value?.button}
        styles={mergedStyles.value?.button}
        class={btnClassName.value}
        color={enterButtonSlot.value ? 'primary' : 'default'}
        size={size.value}
        disabled={disabled}
        key="enterButton"
        onMousedown={onMouseDown}
        onClick={handleSearch}
        loading={loading}
        icon={searchIcon.value}
        variant={
          variant === 'borderless' || variant === 'filled' || variant === 'underlined'
            ? 'text'
            : enterButtonSlot.value
              ? 'solid'
              : undefined
        }
      >
        <Render content={enterButtonSlot.value}></Render>
      </Button>
    );
  }
  if (addonAfterSlot.value) {
    button = [button, cloneVNode(<Render content={addonAfterSlot.value}></Render>, { key: 'addonAfter' })];
  }
  return button;
});

const mergedClassName = computed(() => {
  return clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-${size.value}`]: !!size.value,
      [`${prefixCls.value}-with-button`]: !!enterButton,
    },
    className,
    mergedClassNames?.value?.root,
  );
});

const handleOnCompositionStart = (e: CompositionEvent) => {
  composedRef.value = true;
  emits('compositionstart', e);
};

const handleOnCompositionEnd = (e: CompositionEvent) => {
  composedRef.value = false;
  emits('compositionend', e);
};
</script>
<template>
  <Input
    ref="inputRef"
    v-bind="{ ...restProps, ...$attrs }"
    v-model:value="value"
    :class="mergedClassName"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :prefix-cls="inputPrefix"
    type="search"
    :size="size"
    :variant="variant"
    :addon-after="button"
    :suffix="suffixSlot"
    :disabled="disabled"
    @press-enter="handlePressEnter"
    @change="onChange"
    @compositionstart="handleOnCompositionStart"
    @compositionend="handleOnCompositionEnd"
  />
</template>
