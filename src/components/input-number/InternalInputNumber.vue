<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type ComponentInstance } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import { useMergeSemantic } from '../_util/hooks';
import { useCompactItemContext } from '../space/CompactContext';
import { DownOutlined, MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons-vue';
import useSize from '../config-provider/hooks/useSize';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useVariant from '../form/hooks/useVariants';
import clsx from 'clsx';
import RcInputNumber from '@/vc-component/input-number';
import Render from '@/vc-component/render';
import type { ValueType } from '@/vc-component/mini-decimal';
import { useFormItemInputContextInject } from '../form/context';
import { getStatusClassNames } from '../_util/statusUtils';
import type { InputNumberClassNamesType, InputNumberProps, InputNumberStylesType } from './index.vue';

type InternalInputNumberProps = InputNumberProps & {
  prefixCls: string;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  size: customizeSize,
  disabled: customDisabled = undefined,
  prefixCls,
  prefix,
  suffix,
  readonly = false,
  status,
  controls = true,
  variant: customVariant,
  class: className,
  style,
  classNames,
  styles,
  mode,
  ...others
} = defineProps<InternalInputNumberProps>();

const value = defineModel<ValueType>('value');

const {
  direction,
  class: contextClassName,
  style: contextStyle,
  styles: contextStyles,
  classNames: contextClassNames,
} = toRefs(useComponentConfig('inputNumber'));

const mergedControls = computed(() => {
  if (!controls || customDisabled || readonly) {
    return false;
  }

  return controls;
});

const controlsTemp = computed(() => (typeof mergedControls.value === 'boolean' ? mergedControls.value : undefined));

const { compactSize, compactItemClassnames } = useCompactItemContext(
  computed(() => prefixCls),
  direction,
);

const upIcon = computed(() => {
  let result: any = mode === 'spinner' ? <PlusOutlined /> : <UpOutlined />;
  if (typeof mergedControls.value === 'object') {
    result = mergedControls.value?.upIcon || result;
  }
  return result;
});

const downIcon = computed(() => {
  let result: any = mode === 'spinner' ? <MinusOutlined /> : <DownOutlined />;
  if (typeof mergedControls.value === 'object') {
    result = mergedControls.value?.downIcon || result;
  }
  return result;
});

const { hasFeedback, isFormItemInput, feedbackIcon } = toRefs(useFormItemInputContextInject());

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const [variant, enableVariantCls] = useVariant(
  'inputNumber',
  computed(() => customVariant),
);

const suffixNode = computed(() => hasFeedback?.value && <Render content={feedbackIcon?.value}></Render>);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<InputNumberClassNamesType, InputNumberStylesType, InputNumberProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      disabled: mergedDisabled.value,
      controls: mergedControls?.value,
    },
  })),
);

function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}

defineExpose({} as ComponentInstance<typeof RcInputNumber>);
</script>
<template>
  <RcInputNumber
    :ref="changeRef"
    v-bind="{ ...others, ...$attrs }"
    v-model:value="value"
    :mode="mode"
    :class="
      clsx(
        className,
        rootClassName,
        mergedClassNames.root,
        contextClassName,
        compactItemClassnames,

        getStatusClassNames(prefixCls, status, hasFeedback),
        {
          [`${prefixCls}-${variant}`]: enableVariantCls,
          [`${prefixCls}-lg`]: mergedSize === 'large',
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-rtl`]: direction === 'rtl',
          [`${prefixCls}-in-form-item`]: isFormItemInput,
          [`${prefixCls}-without-controls`]: !mergedControls,
        },
      )
    "
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :up-handler="upIcon"
    :down-handler="downIcon"
    :prefix-cls="prefixCls"
    :readonly="readonly"
    :controls="controlsTemp"
    :prefix="prefix"
    :suffix="suffixNode || suffix"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
  />
</template>
