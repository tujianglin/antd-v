<script lang="tsx" setup>
import type { SwitchChangeEventHandler, SwitchClickEventHandler } from '@/vc-component/switch/index.vue';
import RcSwitch from '@/vc-component/switch/index.vue';
import type { VueNode } from '@/vc-util/type';
import { LoadingOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { Wave } from '../_util/wave';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import useStyle from './style';

export type SwitchSize = 'small' | 'default';
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
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ name: 'Switch', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled,
  loading,
  class: className,
  rootClassName,
  style,
  onChange,
  styles,
  classNames: switchClassNames,
  ...restProps
} = defineProps<SwitchProps>();

const checked = defineModel('checked', { default: false });

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('switch'));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => (customDisabled ?? disabled.value) || loading);

const prefixCls = computed(() => getPrefixCls.value('switch', customizePrefixCls));

// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

const mergedSize = useSize(computed(() => customizeSize));

const classes = computed(() =>
  clsx(
    contextClassName?.value,
    {
      [`${prefixCls.value}-small`]: mergedSize.value === 'small',
      [`${prefixCls.value}-loading`]: loading,
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
    },
    className,
    rootClassName,
    switchClassNames?.root,
    contextClassNames?.value?.root,
    hashId.value,
    cssVarCls.value,
  ),
);

const mergedStyle = computed(() => ({
  ...contextStyles?.value?.root,
  ...styles?.root,
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
      :class-names="{ content: clsx(contextClassNames?.content, switchClassNames?.content) }"
      :styles="{
        content: { ...contextStyles?.content, ...styles?.content },
      }"
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
