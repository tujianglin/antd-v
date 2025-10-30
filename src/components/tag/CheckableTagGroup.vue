<script lang="tsx" setup>
import Render from '@/vc-component/render';
import useControlledState from '@/vc-util/hooks/useControlledState';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import CheckableTag from './CheckableTag.vue';
import useStyle from './style';

type CheckableTagValue = string | number;

export type CheckableTagOption = {
  value: CheckableTagValue;
  label: VueNode;
};

interface CheckableTagGroupSingleProps {
  multiple?: false;
  value?: CheckableTagValue | null;
  defaultValue?: CheckableTagValue | null;
  onChange?: (value: CheckableTagValue | null) => void;
}

interface CheckableTagGroupMultipleProps {
  multiple: true;
  value?: CheckableTagValue[];
  defaultValue?: CheckableTagValue[];
  onChange?: (value: CheckableTagValue[]) => void;
}

export type SemanticName = 'root' | 'item';

export type CheckableTagGroupProps = {
  // style
  prefixCls?: string;
  rootClassName?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;

  options?: (CheckableTagOption | CheckableTagValue)[];
  disabled?: boolean;
} & (CheckableTagGroupSingleProps | CheckableTagGroupMultipleProps) & {
    class?: string;
    style?: CSSProperties;
    id?: string;
    role?: string;
    [key: `data-${string}`]: any;
    [key: `aria-${string}`]: any;
  };
export interface CheckableTagGroupRef {
  nativeElement: HTMLDivElement;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  id,

  prefixCls: customizePrefixCls,
  rootClassName,
  class: className,
  style,
  classNames,
  styles,

  disabled,
  options,
  value,
  defaultValue,
  onChange,
  multiple,

  ...restProps
} = defineProps<CheckableTagGroupProps>();

const { getPrefixCls, direction } = toRefs(useComponentConfig('tag'));

const prefixCls = computed(() => getPrefixCls.value('tag', customizePrefixCls));
const groupPrefixCls = computed(() => `${prefixCls.value}-checkable-group`);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// =============================== Option ===============================
const parsedOptions = computed(() =>
  (options || []).map((option) => {
    if (option && typeof option === 'object') {
      return option as CheckableTagOption;
    }
    return {
      value: option,
      label: option,
    } as CheckableTagOption;
  }),
);

// =============================== Values ===============================
const [mergedValue, setMergedValue] = useControlledState(
  defaultValue,
  computed(() => value),
);

const handleChange = (checked: boolean, option: CheckableTagOption) => {
  let newValue: CheckableTagValue | CheckableTagValue[] | null = null;

  if (multiple) {
    const valueList = (mergedValue.value || []) as CheckableTagValue[];
    newValue = checked ? [...valueList, option.value] : valueList.filter((item) => item !== option.value);
  } else {
    newValue = checked ? option.value : null;
  }

  setMergedValue(newValue);
  onChange?.(newValue as any); // TS not support generic type in function call
};

// ================================ Refs ================================
const divRef = ref<HTMLDivElement>(null);

defineExpose({
  get nativeElement() {
    return divRef.value;
  },
});

// ================================ ARIA ================================
const ariaProps = computed(() =>
  pickAttrs(restProps, {
    aria: true,
    data: true,
  }),
);
</script>
<template>
  <div
    v-bind="ariaProps"
    :class="
      clsx(
        groupPrefixCls,
        rootClassName,
        {
          [`${groupPrefixCls}-disabled`]: disabled,
          [`${groupPrefixCls}-rtl`]: direction === 'rtl',
        },
        hashId,
        cssVarCls,
        className,
        classNames?.root,
      )
    "
    :style="{
      ...styles?.root,
      ...style,
    }"
    :id="id"
    ref="divRef"
  >
    <CheckableTag
      v-for="option in parsedOptions"
      :key="option.value"
      :class="clsx(`${groupPrefixCls}-item`, classNames?.item)"
      :style="styles?.item"
      :checked=" multiple
              ? ((mergedValue as CheckableTagValue[]) || []).includes(option.value)
              : mergedValue === option.value"
      @change="(checked) => handleChange(checked, option)"
      :disabled="disabled"
    >
      <Render :content="option.label" />
    </CheckableTag>
  </div>
</template>
