<script lang="tsx" setup>
import { isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { computed, getCurrentInstance, toRefs } from 'vue';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import { useConfigContextInject } from '../config-provider';
import Select from '../select';
import type { BaseOptionType, DefaultOptionType, InternalSelectProps, SelectProps } from '../select/index.vue';

export type AutoCompleteSemanticName = 'root' | 'prefix' | 'input' | 'placeholder' | 'content';

type PopupSemantic = 'root' | 'listItem' | 'list';

export interface DataSourceItemObject {
  value: string;
  text: string;
}
export type DataSourceItemType = DataSourceItemObject | VueNode;

export type AutoCompleteClassNamesType = SemanticClassNamesType<
  AutoCompleteProps,
  AutoCompleteSemanticName,
  { popup?: SemanticClassNames<PopupSemantic> }
>;

export type AutoCompleteStylesType = SemanticStylesType<
  AutoCompleteProps,
  AutoCompleteSemanticName,
  { popup?: SemanticStyles<PopupSemantic> }
>;

export interface AutoCompleteProps<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>
  extends Omit<InternalSelectProps<ValueType, OptionType>, 'loading' | 'mode' | 'optionLabelProp' | 'labelInValue'> {
  status?: InputStatus;
  popupMatchSelectWidth?: boolean | number;
  styles?: AutoCompleteStylesType;
  classNames?: AutoCompleteClassNamesType;
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

// =========== Merged Props for Semantic ===========
const vm = getCurrentInstance();

// ========================= Style ==========================
const [mergedClassNames, mergedStyles] = useMergeSemantic<AutoCompleteClassNamesType, AutoCompleteStylesType, AutoCompleteProps>(
  computed(() => [classNames]),
  computed(() => [styles]),
  computed(() => ({
    props: {
      ...vm.props,
    },
  })),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);

const finalClassNames = computed(() => ({
  root: clsx(`${prefixCls.value}-auto-complete`, className, rootClassName, mergedClassNames.value?.root, {
    [`${prefixCls.value}-customize`]: customizeInput,
  }),
  prefix: mergedClassNames.value?.prefix,
  input: mergedClassNames.value?.input,
  placeholder: mergedClassNames.value?.placeholder,
  content: mergedClassNames.value?.content,
  popup: {
    root: clsx(popupClassName, mergedClassNames.value?.popup?.root),
    list: mergedClassNames.value?.popup?.list,
    listItem: mergedClassNames.value?.popup?.listItem,
  },
}));

const finalStyles = computed(() => ({
  root: { ...mergedStyles.value?.root, ...style },
  input: mergedStyles.value?.input,
  prefix: mergedStyles.value?.prefix,
  placeholder: mergedStyles.value?.placeholder,
  content: mergedStyles.value?.content,
  popup: {
    root: { ...mergedStyles.value?.popup?.root },
    list: mergedStyles.value?.popup?.list,
    listItem: mergedStyles.value?.popup?.listItem,
  },
}));
</script>
<template>
  <Select
    v-bind="omit($props, ['popupClassName'])"
    :suffix-icon="null"
    :prefix-cls="prefixCls"
    :class-names="finalClassNames"
    :styles="finalStyles"
    :mode="Select.SECRET_COMBOBOX_MODE_DO_NOT_USE as SelectProps['mode']"
    @popup-visible-change="onOpenChange"
    :get-input-element="getInputElement"
  />
</template>
