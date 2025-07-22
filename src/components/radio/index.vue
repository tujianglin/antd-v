<script lang="tsx" setup>
import VcCheckbox from '@/vc-component/checkbox/index.vue';
import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import { computed, toRefs } from 'vue';
import { useComposeRef } from '../_util/type';
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

const radioPrefixCls = getPrefixCls.value('radio', customizePrefixCls);
const isButtonType = computed(() => (groupContext?.optionType || radioOptionTypeContext.value) === 'button');
const prefixCls = computed(() => (isButtonType.value ? `${radioPrefixCls}-button` : radioPrefixCls));

// Style
const rootCls = useCSSVarCls(radioPrefixCls);
const [hashId, cssVarCls] = useStyle(radioPrefixCls, rootCls);
const disabled = useDisabledContextInject();

const radioProps = computed((): RadioProps => {
  const result: RadioProps = {};
  if (!isEmpty(groupContext)) {
    result.name = groupContext.name;
    result.onChange = onChange;
    result.checked = value.value === groupContext.value;
    result.disabled = restProps.disabled ?? groupContext.disabled;
  }
  result.disabled = restProps.disabled ?? disabled.value;
  return { ...restProps, ...result };
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
    hashId,
    cssVarCls,
    rootCls,
  );
});

function onChange(e: RadioChangeEvent) {
  restProps.onChange?.(e);
  groupContext?.onChange?.(e);
}
const [onLabelClick, onInputClick] = useBubbleLock(radioProps.value.onClick);

const mergedRef = useComposeRef();
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
      <VcCheckbox
        v-bind="{...radioProps as any, ...$attrs}"
        :class="
          clsx(radioClassNames?.icon, contextClassNames.icon, {
            [TARGET_CLS]: !isButtonType,
          })
        "
        :style="{ ...contextStyles.icon, ...styles?.icon }"
        type="radio"
        :prefix-cls="prefixCls"
        :ref="mergedRef"
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
