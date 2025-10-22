<script lang="tsx" setup>
import VcCheckbox from '@/vc-component/checkbox/index.vue';
import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { computed, onBeforeUnmount, onMounted, toRefs, useSlots, useTemplateRef, watch } from 'vue';
import { Wave } from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useCheckboxGroupContextInject } from './GroupContext';
import type { CheckboxProps } from './interface';
import useStyle from './style';
import useBubbleLock from './useBubbleLock';

defineOptions({ name: 'Checkbox', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  indeterminate = false,
  style,
  onMouseenter,
  onMouseleave,
  skipGroup = false,
  disabled,
  classNames: checkboxClassNames,
  styles,
  ...restProps
} = defineProps<CheckboxProps>();
const slots = useSlots();

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('checkbox'));

const checkboxGroup = useCheckboxGroupContextInject();
const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => (checkboxGroup?.disabled || disabled) ?? contextDisabled.value);

const value = defineModel('value');

const checkboxRef = useTemplateRef('checkboxRef');

onMounted(() => {
  checkboxGroup?.registerValue?.(restProps.value);
});

watch(
  () => value.value,
  (val) => {
    if (skipGroup) {
      return;
    }
    checkboxGroup?.cancelValue?.(val);
    checkboxGroup?.registerValue?.(restProps.value);
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  checkboxGroup?.cancelValue?.(restProps.value);
});

watch(
  () => indeterminate,
  (val) => {
    if (checkboxRef.value?.input) {
      checkboxRef.value.input.indeterminate = val;
    }
  },
  { immediate: true, deep: true },
);

const prefixCls = computed(() => getPrefixCls.value('checkbox', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const checkboxProps = computed(() => {
  const result: CheckboxProps = {};
  if (!isEmpty(checkboxGroup) && !skipGroup) {
    result.onChange = (...args) => {
      if (restProps.onChange) {
        restProps.onChange(...args);
      }
      if (checkboxGroup.toggleOption) {
        checkboxGroup.toggleOption({ label: slots.default, value: value.value });
      }
    };
    result.name = checkboxGroup.name;
    result.checked = checkboxGroup.value?.includes(value.value);
  }
  return { ...restProps, ...result };
});

const classString = computed(() => {
  return clsx(
    `${prefixCls.value}-wrapper`,
    {
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-wrapper-checked`]: checkboxProps.value.checked,
      [`${prefixCls.value}-wrapper-disabled`]: mergedDisabled.value,
    },
    contextClassName?.value,
    className,
    contextClassNames.value.root,
    checkboxClassNames?.root,
    rootClassName,
    cssVarCls.value,
    rootCls.value,
    hashId.value,
  );
});
const checkboxClass = computed(() => {
  return clsx(
    checkboxClassNames?.icon,
    contextClassNames.value.icon,
    { [`${prefixCls.value}-indeterminate`]: indeterminate },
    TARGET_CLS,
    hashId.value,
  );
});

// ============================ Event Lock ============================
const [onLabelClick, onInputClick] = useBubbleLock(checkboxProps.value.onClick);
</script>
<template>
  <Wave component="Checkbox" :disabled="mergedDisabled">
    <label
      :className="classString"
      :style="{
        ...contextStyles.root,
        ...styles?.root,
        ...contextStyle,
        ...style,
      }"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
      @click="onLabelClick"
    >
      <VcCheckbox
        v-bind="{ ...checkboxProps as any, ...$attrs }"
        @click="onInputClick"
        :prefix-cls="prefixCls"
        :class="checkboxClass"
        :style="{ ...contextStyles.icon, ...styles?.icon }"
        :disabled="mergedDisabled"
        ref="checkboxRef"
      />
      <span
        v-if="$slots.default"
        :class="clsx(`${prefixCls}-label`, contextClassNames.label, checkboxClassNames?.label)"
        :style="{ ...contextStyles.label, ...styles?.label }"
      >
        <slot></slot>
      </span>
    </label>
  </Wave>
</template>
