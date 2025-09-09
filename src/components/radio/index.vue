<script lang="tsx" setup>
import RcCheckbox from '@/vc-component/checkbox/index.vue';
import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { computed, getCurrentInstance, toRefs } from 'vue';
import { Wave } from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import useBubbleLock from '../checkbox/useBubbleLock';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useRadioGroupContextInject, useRadioOptionTypeContextInject } from './context';
import type { RadioChangeEvent, RadioProps } from './interface';
import useStyle from './style';

defineOptions({ name: 'Radio', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  title,
  classNames: radioClassNames,
  styles,
  ...restProps
} = defineProps<RadioProps>();

const value = defineModel('value');
const groupContext = useRadioGroupContextInject();
const radioOptionTypeContext = useRadioOptionTypeContextInject();

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('radio'));

const radioPrefixCls = computed(() => getPrefixCls.value('radio', customizePrefixCls));
const isButtonType = computed(() => (groupContext?.optionType || radioOptionTypeContext.value) === 'button');
const prefixCls = computed(() => (isButtonType.value ? `${radioPrefixCls.value}-button` : radioPrefixCls.value));

// Style
const rootCls = useCSSVarCls(radioPrefixCls);
const [hashId, cssVarCls] = useStyle(radioPrefixCls, rootCls);
const disabled = useDisabledContextInject();

const radioProps = computed(() => {
  const result: RadioProps = {};
  if (!isEmpty(groupContext)) {
    result.name = groupContext.name;
    result.onChange = onChange;
    result.checked = value.value === groupContext.value;
    result.disabled = restProps.disabled ?? groupContext.disabled;
  }
  result.disabled = restProps.disabled ?? disabled.value;
  return { ...restProps, ...result } as any;
});

const wrapperClassString = computed(() => {
  return clsx(
    `${prefixCls.value}-wrapper`,
    {
      [`${prefixCls.value}-wrapper-checked`]: radioProps.value?.checked,
      [`${prefixCls.value}-wrapper-disabled`]: radioProps.value?.disabled,
      [`${prefixCls.value}-wrapper-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-wrapper-block`]: !!groupContext?.block,
    },
    contextClassName?.value,
    className,
    rootClassName,
    contextClassNames.value?.root,
    radioClassNames?.root,
    hashId.value,
    cssVarCls.value,
    rootCls.value,
  );
});

function onChange(e: RadioChangeEvent) {
  restProps.onChange?.(e);
  groupContext?.onChange?.(e);
}
const [onLabelClick, onInputClick] = useBubbleLock(radioProps.value.onClick);

const vm = getCurrentInstance();
function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}
</script>
<template>
  <Wave component="Radio" :disabled="radioProps.disabled">
    <label
      :class="wrapperClassString"
      :style="{ ...contextStyles.root, ...styles?.root, ...contextStyle, ...style }"
      @mouseenter="restProps.onMouseenter"
      @mouseleave="restProps.onMouseleave"
      :title="title"
      @click="onLabelClick"
    >
      <RcCheckbox
        v-bind="{ ...radioProps, ...$attrs }"
        :class="
          clsx(radioClassNames?.icon, contextClassNames.icon, {
            [TARGET_CLS]: !isButtonType,
          })
        "
        :style="{ ...contextStyles.icon, ...styles?.icon }"
        type="radio"
        :prefix-cls="prefixCls"
        :ref="changeRef"
        @click="onInputClick"
      />
      <span
        v-if="$slots.default"
        :class="clsx(`${prefixCls}-label`, contextClassNames.label, radioClassNames?.label)"
        :style="{ ...contextStyles.label, ...styles?.label }"
      >
        <slot></slot>
      </span>
    </label>
  </Wave>
</template>
