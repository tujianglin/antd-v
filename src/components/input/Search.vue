<script lang="tsx" setup>
import { computed, getCurrentInstance, ref, toRefs, useTemplateRef, type VNode } from 'vue';
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
import Input, { type InputProps } from './Input.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import Button from '../button';
import Render from '@/vc-component/render';
import clsx from 'clsx';
import type { ButtonSemanticName } from '../button/interface';
import type { ValueType } from '@/vc-component/input/interface';
import type { VueNode } from '@/vc-util/type';
import Compact from '../space/Compact.vue';
import useStyle from './style/search';
import pickAttrs from '@/vc-util/pickAttrs';
import { omit } from 'es-toolkit';
import { cloneElement } from '@/vc-util/Children/util';

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
  classNames?: InputSearchClassNamesType;
  styles?: InputSearchStylesType;
}

defineOptions({ name: 'InputSearch', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  inputPrefixCls: customizeInputPrefixCls,
  class: className,
  size: customizeSize,
  suffix,
  enterButton = false,
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

const slots = defineSlots<{
  suffix?: () => VNode[];
  enterButton?: () => VNode[];
}>();

const value = defineModel<ValueType>('value');

const suffixSlot = computed(() => slots.suffix || suffix);
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
const inputPrefixCls = computed(() => getPrefixCls.value('input', customizeInputPrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);
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

function onMousedown(e: MouseEvent) {
  if (document.activeElement === inputRef.value?.input) {
    e.preventDefault();
  }
}

function onSearch(e: MouseEvent | KeyboardEvent) {
  emits('search', inputRef.value.input.value, e, {
    source: 'input',
  });
}

function onPressEnter(e: KeyboardEvent) {
  if (composedRef.value || loading) {
    return;
  }
  customOnPressEnter?.(e);
  onSearch(e);
}

const searchIcon = computed(() => (typeof enterButton === 'boolean' ? <SearchOutlined /> : null));
const btnClassName = computed(() => clsx(`${prefixCls.value}-button`, mergedClassNames?.value?.button?.root));

const SearchButton = () => {
  let button;
  const enterButtonAsElement = (enterButton || {}) as VNode;
  const isAntdButton = enterButtonAsElement.type && (enterButtonAsElement.type as typeof Button).name === 'Button';
  if (isAntdButton) {
    button = cloneElement(enterButtonAsElement, {
      onMousedown,
      onClick: (e: MouseEvent) => {
        enterButtonAsElement?.props?.onClick?.(e);
        onSearch(e);
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
        onMousedown={onMousedown}
        onClick={onSearch}
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
        {enterButtonSlot.value && <Render content={enterButtonSlot.value}></Render>}
      </Button>
    );
  }
  return button;
};

const mergedClassName = computed(() => {
  return clsx(
    prefixCls.value,
    cssVarCls.value,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-${size.value}`]: !!size.value,
      [`${prefixCls.value}-with-button`]: !!enterButton,
    },
    className,
    hashId.value,
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

// ========================== Render ==========================
// >>> Root Props
const rootProps = computed(() => pickAttrs(restProps, { data: true }));

const inputProps = computed(() => {
  return omit(
    {
      ...restProps,
      classNames: omit(mergedClassNames.value, ['button', 'root']),
      styles: omit(mergedStyles.value, ['button', 'root']),
      prefixCls: inputPrefixCls.value,
      type: 'search',
      size,
      variant,
      onPressEnter,
      onCompositionStart: handleOnCompositionStart,
      onCompositionEnd: handleOnCompositionEnd,
      onChange,
      disabled,
    },
    Object.keys(rootProps?.value) as any,
  );
});
</script>
<template>
  <Compact :class="mergedClassName" :style="{ ...style, ...mergedStyles?.root }" v-bind="rootProps" :hidden="hidden">
    <Input ref="inputRef" v-bind="{ ...inputProps, ...$attrs }" v-model:value="value" :suffix="suffixSlot" />
    <SearchButton />
  </Compact>
</template>
