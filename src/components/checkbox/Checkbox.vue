<script lang="tsx" setup>
import VcCheckbox from '@/vc-component/checkbox/index.vue';
import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, toRefs, useTemplateRef, watch, type VNode } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { Wave } from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useCheckboxGroupContextInject } from './GroupContext';
import type { CheckboxClassNamesType, CheckboxProps, CheckboxStylesType } from './interface';
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
  disabled = undefined,
  classNames,
  styles,
  ...restProps
} = defineProps<CheckboxProps>();
const slots = defineSlots<{
  default: () => VNode[];
}>();

const checked = defineModel('checked', { default: false });

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

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<CheckboxClassNamesType, CheckboxStylesType, CheckboxProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      indeterminate,
      disabled: mergedDisabled.value,
    },
  })),
);

const prevValue = ref(restProps.value);
const checkboxRef = useTemplateRef('checkboxRef');

onMounted(() => {
  checkboxGroup?.registerValue?.(restProps.value);
});

watch(
  () => restProps.value,
  () => {
    if (skipGroup) {
      return;
    }
    checkboxGroup?.cancelValue?.(prevValue.value);
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
  const result: CheckboxProps & { checked?: boolean } = {};
  if (!isEmpty(checkboxGroup) && !skipGroup) {
    result.onChange = (...args) => {
      if (restProps.onChange) {
        restProps.onChange(...args);
      }
      if (checkboxGroup.toggleOption) {
        checkboxGroup.toggleOption({ label: slots.default, value: restProps.value });
      }
    };
    result.name = checkboxGroup.name;
    result.checked = checkboxGroup.value?.includes(restProps.value);
  }
  return { ...restProps, ...result };
});

const classString = computed(() => {
  return clsx(
    `${prefixCls.value}-wrapper`,
    {
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-wrapper-checked`]: checked.value,
      [`${prefixCls.value}-wrapper-disabled`]: mergedDisabled.value,
    },
    contextClassName?.value,
    className,
    mergedClassNames.value?.root,
    rootClassName,
    cssVarCls.value,
    rootCls.value,
    hashId.value,
  );
});
const checkboxClass = computed(() => {
  return clsx(mergedClassNames?.value?.icon, { [`${prefixCls.value}-indeterminate`]: indeterminate }, TARGET_CLS, hashId.value);
});

// ============================ Event Lock ============================
const [onLabelClick, onInputClick] = useBubbleLock(checkboxProps.value.onClick);
</script>
<template>
  <Wave component="Checkbox" :disabled="mergedDisabled">
    <label
      :className="classString"
      :style="{
        ...mergedStyles.root,
        ...contextStyle,
        ...style,
      }"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
      @click="onLabelClick"
    >
      <VcCheckbox
        v-if="!isEmpty(checkboxGroup) && !skipGroup"
        v-bind="{ ...checkboxProps as any, ...$attrs }"
        @click="onInputClick"
        :prefix-cls="prefixCls"
        :class="checkboxClass"
        :style="mergedStyles.icon"
        :disabled="mergedDisabled"
        ref="checkboxRef"
      />
      <VcCheckbox
        v-else
        v-bind="{ ...checkboxProps as any, ...$attrs }"
        v-model:checked="checked"
        @click="onInputClick"
        :prefix-cls="prefixCls"
        :class="checkboxClass"
        :style="mergedStyles.icon"
        :disabled="mergedDisabled"
        ref="checkboxRef"
      />

      <span v-if="$slots.default" :class="clsx(`${prefixCls}-label`, mergedClassNames?.label)" :style="mergedStyles.label">
        <slot></slot>
      </span>
    </label>
  </Wave>
</template>
