<script lang="tsx" setup>
import type { SwitchChangeEventHandler, SwitchClickEventHandler } from '@/vc-component/switch/index.vue';
import RcSwitch from '@/vc-component/switch/index.vue';
import type { VueNode } from '@/vc-util/type';
import { LoadingOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { Wave } from '../_util/wave';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import useStyle from './style';

export type SwitchSize = 'small' | 'default';

export type SwitchClassNamesType = SemanticClassNamesType<SwitchProps, SemanticName>;
export type SwitchStylesType = SemanticStylesType<SwitchProps, SemanticName>;

export type { SwitchChangeEventHandler, SwitchClickEventHandler };

type SemanticName = 'root' | 'content';
export interface SwitchProps {
  prefixCls?: string;
  size?: SwitchSize;
  class?: string;
  rootClassName?: string;
  onChange?: SwitchChangeEventHandler;
  onClick?: SwitchClickEventHandler;
  checkedChildren?: VueNode;
  unCheckedChildren?: VueNode;
  disabled?: boolean;
  loading?: boolean;
  autofocus?: boolean;
  style?: CSSProperties;
  title?: string;
  tabindex?: number;
  id?: string;
  checkedValue?: boolean | string | number;
  unCheckedValue?: boolean | string | number;
  classNames?: SwitchClassNamesType;
  styles?: SwitchStylesType;
}

defineOptions({ name: 'Switch', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled = undefined,
  loading,
  class: className,
  rootClassName,
  style,
  onChange,
  styles,
  classNames,
  checkedValue = undefined,
  unCheckedValue = undefined,
  ...restProps
} = defineProps<SwitchProps>();

const checked = defineModel<number | string | boolean>('value', {
  default: false,
  get(val) {
    if (val === checkedValue) return true;
    if (val === unCheckedValue) return false;
    return Boolean(val);
  },
  set(value) {
    if (!checkedValue && !unCheckedValue) return value;
    return value ? checkedValue : unCheckedValue;
  },
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('switch'));

// ===================== Disabled =====================
// eslint-disable-next-line vue/no-dupe-keys
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => (customDisabled ?? disabled.value) || loading);

const prefixCls = computed(() => getPrefixCls.value('switch', customizePrefixCls));

// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

const mergedSize = useSize(computed(() => customizeSize));

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<SwitchClassNamesType, SwitchStylesType, SwitchProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      disabled: mergedDisabled.value,
    },
  })),
);

const classes = computed(() =>
  clsx(
    contextClassName?.value,
    {
      [`${prefixCls.value}-small`]: mergedSize.value === 'small',
      [`${prefixCls.value}-loading`]: loading,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    rootClassName,
    mergedClassNames?.value?.root,
    hashId.value,
    cssVarCls.value,
  ),
);

const mergedStyle = computed(() => ({
  ...mergedStyles?.value?.root,
  ...contextStyle?.value,
  ...style,
}));

const changeHandler: SwitchChangeEventHandler = (...args) => {
  checked.value = args[0];
  onChange?.(...args);
};
</script>
<template>
  <Wave component="Switch">
    <RcSwitch
      v-bind="restProps"
      :class-names="{ content: mergedClassNames.content }"
      :styles="{ content: mergedStyles.content }"
      v-model:checked="checked"
      @change="changeHandler"
      :prefix-cls="prefixCls"
      :class="classes"
      :style="mergedStyle"
      :disabled="mergedDisabled"
    >
      <template #loadingIcon>
        <slot name="loadingIcon">
          <div :class="`${prefixCls}-handle`">
            <LoadingOutlined v-if="loading" :class="`${prefixCls}-loading-icon`" />
          </div>
        </slot>
      </template>
      <template #checkedChildren>
        <slot name="checkedChildren"></slot>
      </template>
      <template #unCheckedChildren>
        <slot name="unCheckedChildren"></slot>
      </template>
    </RcSwitch>
  </Wave>
</template>
