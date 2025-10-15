<script lang="tsx" setup>
import type { CascaderProps as RcCascaderProps } from '@/vc-component/cascader';
import { Panel } from '@/vc-component/cascader';
import type { PickType } from '@/vc-component/cascader/Panel.vue';
import type { CascaderProps, DefaultOptionType } from './index.vue';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useBase from './hooks/useBase';
import useCheckable from './hooks/useCheckable';
import useColumnIcons from './hooks/useColumnIcons';
import useStyle from './style';
import usePanelStyle from './style/panel';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { computed } from 'vue';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import clsx from 'clsx';
import type { SingleValueType } from '@/vc-component/cascader/Cascader.vue';
export type PanelPickType = Exclude<PickType, 'checkable'> | 'multiple' | 'rootClassName';

export type CascaderPanelProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
> = Pick<CascaderProps<OptionType, ValueField, Multiple>, PanelPickType>;

export type CascaderPanelAutoProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> =
  | (CascaderPanelProps<OptionType, ValueField> & { multiple?: false })
  | (CascaderPanelProps<OptionType, ValueField, true> & { multiple: true });

type OptionType = DefaultOptionType;
type ValueField = keyof OptionType;

defineOptions({ name: 'Cascader', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  multiple,
  rootClassName,
  notFoundContent,
  direction,
  expandIcon,
  disabled: customDisabled,
} = defineProps<CascaderPanelAutoProps<OptionType, ValueField>>();

const value = defineModel<SingleValueType[]>('value');

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const [prefixCls, cascaderPrefixCls, mergedDirection, renderEmpty] = useBase(
  computed(() => customizePrefixCls),
  computed(() => direction),
);

const rootCls = useCSSVarCls(cascaderPrefixCls);
const [hashId, cssVarCls] = useStyle(cascaderPrefixCls, rootCls);
usePanelStyle(cascaderPrefixCls);

const isRtl = computed(() => mergedDirection.value === 'rtl');

// ===================== Icon ======================
const [mergedExpandIcon, loadingIcon] = useColumnIcons(prefixCls, isRtl, expandIcon);

// ===================== Empty =====================
const mergedNotFoundContent = computed(
  () => notFoundContent || renderEmpty?.value?.('Cascader') || <DefaultRenderEmpty componentName="Cascader" />,
);

// =================== Multiple ====================
const checkable = useCheckable(
  cascaderPrefixCls,
  computed(() => multiple),
);
</script>
<template>
  <Panel
    v-bind="{...($props as Pick<RcCascaderProps, PickType>)}"
    v-model:value="value"
    :checkable="checkable"
    :prefix-cls="cascaderPrefixCls"
    :class="clsx(className, hashId, rootClassName, cssVarCls, rootCls)"
    :not-found-content="mergedNotFoundContent"
    :direction="mergedDirection"
    :expand-icon="mergedExpandIcon"
    :loading-icon="loadingIcon"
    :disabled="mergedDisabled"
  />
</template>
