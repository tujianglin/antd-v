<script lang="tsx" setup>
import RcInputNumber from '@/vc-component/input-number';
import type { ValueType } from '@/vc-component/mini-decimal';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type ComponentInstance, type VNode } from 'vue';
import type { InputNumberProps as VcInputNumberProps } from '../../vc-component/input-number';
import { type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { getMergedStatus, type InputStatus } from '../_util/statusUtils';
import { useComponentConfig, type Variant } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { SizeType } from '../config-provider/SizeContext';
import { useFormItemInputContextInject } from '../form/context';
import InternalInputNumber from './InternalInputNumber.vue';
import useStyle from './style';

type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'actions';

export type InputNumberClassNamesType = SemanticClassNamesType<InputNumberProps, SemanticName>;
export type InputNumberStylesType = SemanticStylesType<InputNumberProps, SemanticName>;
export interface InputNumberProps extends Omit<VcInputNumberProps, 'prefix' | 'size' | 'controls' | 'classNames' | 'styles'> {
  prefixCls?: string;
  mode?: 'input' | 'spinner';
  rootClassName?: string;
  classNames?: InputNumberClassNamesType;
  styles?: InputNumberStylesType;
  prefix?: VueNode;
  suffix?: VueNode;
  readonly?: boolean;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: VueNode; downIcon?: VueNode };
  variant?: Variant;
}

defineOptions({ name: 'InputNumber', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  status: customStatus,
  rootClassName,
  disabled = undefined,
  readonly = false,
  controls = true,
  changeOnBlur = true,
  keyboard = true,
  ...rest
} = defineProps<InputNumberProps>();

const slots = defineSlots<{
  prefix?: () => VNode[];
  suffix?: () => VNode[];
}>();

const prefix = computed(() => slots.prefix || rest.prefix);
const suffix = computed(() => slots.suffix || rest.suffix);

const value = defineModel<ValueType>('value');

const { getPrefixCls } = toRefs(useComponentConfig('inputNumber'));
const prefixCls = computed(() => getPrefixCls.value('input-number', customizePrefixCls));

const { status: contextStatus } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const vm = getCurrentInstance();
function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}

defineExpose({} as ComponentInstance<typeof RcInputNumber>);
</script>
<template>
  <InternalInputNumber
    :ref="changeRef"
    v-bind="rest"
    v-model:value="value"
    :prefix="prefix"
    :suffix="suffix"
    :disabled="disabled"
    :readonly="readonly"
    :controls="controls as any"
    :change-on-blur="changeOnBlur"
    :keyboard="keyboard"
    :prefix-cls="prefixCls"
    :status="mergedStatus"
    :class="clsx(cssVarCls, rootCls, hashId, className)"
    :root-class-name="rootClassName"
  />
</template>
