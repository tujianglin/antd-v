<script lang="tsx" setup>
import { isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, toRefs, type CSSProperties } from 'vue';
import type { InputStatus } from '../_util/statusUtils';
import { useConfigContextInject } from '../config-provider';
import Select from '../select';
import type { BaseOptionType, DefaultOptionType, InternalSelectProps, SelectProps } from '../select/index.vue';

export interface DataSourceItemObject {
  value: string;
  text: string;
}
export type DataSourceItemType = DataSourceItemObject | VueNode;

export interface AutoCompleteProps<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>
  extends Omit<InternalSelectProps<ValueType, OptionType>, 'loading' | 'mode' | 'optionLabelProp' | 'labelInValue'> {
  status?: InputStatus;
  popupMatchSelectWidth?: boolean | number;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  popupRender?: (menu: VueNode) => VueNode;
  onOpenChange?: (visible: boolean) => void;
}

defineOptions({ name: 'AutoComplete', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  style,
  popupClassName,
  rootClassName,
  onOpenChange,
  styles,
  classNames,
} = defineProps<AutoCompleteProps>();

const slots = defineSlots<{
  default: () => VueNode[];
}>();

type SemanticName = 'root' | 'prefix' | 'input';
type PopupSemantic = 'root' | 'listItem' | 'list';

function isSelectOptionOrSelectOptGroup(child: any): boolean {
  return child?.type && (child.type.isSelectOption || child.type.isSelectOptGroup);
}

const { getPrefixCls } = toRefs(useConfigContextInject());

// ============================= Input =============================
const customizeInput = computed(() => {
  const childNodes = flattenChildren(slots.default?.());
  let result;
  if (childNodes.length === 1 && isValidElement(childNodes[0]) && !isSelectOptionOrSelectOptGroup(childNodes[0])) {
    [result] = childNodes;
  }
  return result;
});

const getInputElement = computed(() => (customizeInput.value ? () => customizeInput.value! : undefined));

const prefixCls = computed(() => getPrefixCls.value('select', customizePrefixCls));

const mergedClassNames = computed(() => ({
  root: clsx(`${prefixCls.value}-auto-complete`, className, rootClassName, classNames?.root),
  prefix: classNames?.prefix,
  input: classNames?.input,
  popup: {
    root: clsx(popupClassName, classNames?.popup?.root),
    list: classNames?.popup?.list,
    listItem: classNames?.popup?.listItem,
  },
}));

const mergedStyles = computed(() => ({
  root: { ...styles?.root, ...style },
  input: styles?.input,
  prefix: styles?.prefix,
  popup: styles?.popup,
}));
</script>
<template>
  <Select
    v-bind="omit($props, ['popupClassName'])"
    :suffix-icon="null"
    :prefix-cls="prefixCls"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :mode="Select.SECRET_COMBOBOX_MODE_DO_NOT_USE as SelectProps['mode']"
    @popup-visible-change="onOpenChange"
    :get-input-element="getInputElement"
  />
</template>
