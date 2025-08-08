<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import type { RenderNode } from '../_util/type';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Render from '../render';
import { CheckboxGroupContextProvider, type CheckboxGroupContext } from './GroupContext';
import Checkbox from './index.vue';
import type { CheckboxChangeEvent } from './interface';
import useStyle from './style';

export interface CheckboxOptionType<T = any> {
  label: RenderNode;
  value: T;
  style?: CSSProperties;
  class?: string; // 👈 5.25.0+
  disabled?: boolean;
  title?: string;
  id?: string;
  onChange?: (e: CheckboxChangeEvent) => void;
  required?: boolean;
}

export interface AbstractCheckboxGroupProps<T = any> {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  options?: (CheckboxOptionType<T> | string | number)[];
  disabled?: boolean;
  style?: CSSProperties;
}

export interface CheckboxGroupProps<T = any> extends AbstractCheckboxGroupProps<T> {
  name?: string;
  onChange?: (checkedValue: T[]) => void;
}

type InternalCheckboxValueType = string | number | boolean;

defineOptions({ name: 'CheckboxGroup', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  options = [],
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  onChange,
  ...restProps
} = defineProps<CheckboxGroupProps>();

const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const value = defineModel<InternalCheckboxValueType[]>('value');
const registeredValues = ref([]);
const domRef = ref();

const memoizedOptions = computed(() =>
  options.map<CheckboxOptionType>((option: any) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: option, value: option };
    }
    return option;
  }),
);

const cancelValue = (val) => {
  registeredValues.value = registeredValues.value.filter((v) => v !== val);
};

const registerValue: CheckboxGroupContext['registerValue'] = (val) => {
  registeredValues.value = [...registeredValues.value, val];
};

const toggleOption: CheckboxGroupContext['toggleOption'] = (option) => {
  const optionIndex = value.value.indexOf(option.value);
  const newValue = [...value.value];
  if (optionIndex === -1) {
    newValue.push(option.value);
  } else {
    newValue.splice(optionIndex, 1);
  }
  value.value = newValue;
  onChange?.(
    newValue
      .filter((val) => registeredValues.value.includes(val))
      .sort((a, b) => {
        const indexA = memoizedOptions.value.findIndex((opt) => opt.value === a);
        const indexB = memoizedOptions.value.findIndex((opt) => opt.value === b);
        return indexA - indexB;
      }),
  );
};

const prefixCls = getPrefixCls.value('checkbox', customizePrefixCls);
const groupPrefixCls = `${prefixCls}-group`;

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const memoizedContext = computed(() => ({
  toggleOption,
  value: value.value,
  disabled: restProps.disabled,
  name: restProps.name,
  // https://github.com/ant-design/ant-design/issues/16376
  registerValue,
  cancelValue,
}));

const classString = computed(() => {
  return clsx(
    groupPrefixCls,
    {
      [`${groupPrefixCls}-rtl`]: direction.value === 'rtl',
    },
    className,
    rootClassName,
    cssVarCls,
    rootCls,
    hashId,
  );
});

defineExpose({
  $el: () => domRef.value,
});
</script>

<template>
  <div :class="classString" :style="style" v-bind="omit(restProps, ['value', 'disabled'])" ref="domRef">
    <CheckboxGroupContextProvider :value="memoizedContext">
      <template v-if="options?.length > 0">
        <template v-for="option in memoizedOptions" :key="option.value.toString()">
          <Checkbox
            :prefix-cls="prefixCls"
            :disabled="'disabled' in option ? option.disabled : restProps.disabled"
            :value="option.value"
            :checked="value.includes(option.value)"
            @change="option.onChange"
            :class="clsx(`${groupPrefixCls}-item`, option.class)"
            :style="option.style"
            :title="option.title"
            :id="option.id"
            :required="option.required"
          >
            <Render :content="option.label" />
          </Checkbox>
        </template>
      </template>
      <template v-else>
        <slot></slot>
      </template>
    </CheckboxGroupContextProvider>
  </div>
</template>
