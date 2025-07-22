<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, toRefs, useId } from 'vue';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import Render from '../render';
import { RadioGroupContextProvider } from './context';
import Radio from './index.vue';
import type { RadioChangeEvent, RadioGroupButtonStyle, RadioGroupProps } from './interface';
import useStyle from './style';

defineOptions({ name: 'ButtonGroup', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  options,
  buttonStyle = 'outline' as RadioGroupButtonStyle,
  disabled,
  size: customizeSize,
  style,
  id,
  optionType,
  name = useId(),
  block = false,
  onChange,
  onMouseenter,
  onMouseleave,
  onFocus,
  onBlur,
} = defineProps<RadioGroupProps>();
const value = defineModel('value');
const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const domRef = ref<HTMLDivElement>(null);

const onRadioChange = (event: RadioChangeEvent) => {
  const lastValue = value.value;
  const val = event.target.value;
  value.value = val;
  if (val !== lastValue) {
    onChange?.(event);
  }
};

const prefixCls = getPrefixCls.value('radio', customizePrefixCls);
const groupPrefixCls = `${prefixCls}-group`;

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mergedSize = computed(() => useSize(customizeSize));

const classString = computed(() => {
  return clsx(
    groupPrefixCls,
    `${groupPrefixCls}-${buttonStyle}`,
    {
      [`${groupPrefixCls}-${mergedSize.value}`]: mergedSize.value,
      [`${groupPrefixCls}-rtl`]: direction?.value === 'rtl',
      [`${groupPrefixCls}-block`]: block,
    },
    className,
    rootClassName,
    hashId,
    cssVarCls,
    rootCls,
  );
});
const memoizedValue = computed(() => ({ onChange: onRadioChange, value: value.value, disabled, name, optionType, block }));
</script>
<template>
  <div
    v-bind="{ ...$attrs, aria: true, data: true }"
    :class="classString"
    :style="style"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @focus="onFocus"
    @blur="onBlur"
    :id="id"
    ref="domRef"
  >
    <RadioGroupContextProvider :value="memoizedValue">
      <template v-if="options?.length > 0">
        <template v-for="option in options">
          <template v-if="typeof option === 'string' || typeof option === 'number'">
            <Radio
              :key="option.toString()"
              :prefix-cls="prefixCls"
              :disabled="disabled"
              :value="option"
              :checked="value === option"
            >
              {{ option }}
            </Radio>
          </template>
          <template v-else>
            <Radio
              :key="`radio-group-value-options-${option.value}`"
              :prefix-cls="prefixCls"
              :disabled="option.disabled || disabled"
              :value="option.value"
              :checked="value === option.value"
              :title="option.title"
              :style="option.style"
              :class="option.class"
              :id="option.id"
              :required="option.required"
            >
              <Render :content="option.label" />
            </Radio>
          </template>
        </template>
      </template>
      <template v-else>
        {{ console.log(111) }}
        <slot></slot>
      </template>
    </RadioGroupContextProvider>
  </div>
</template>
