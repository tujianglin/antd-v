<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { computed, ref, toRefs, useSlots, type CSSProperties, type HTMLAttributes } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { LayoutContextProvider } from './context';
import useHasSider from './hooks/useHasSider';
import useStyle from './style';

export interface BasicProps extends /** @vue-ignore */ HTMLAttributes {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  suffixCls?: string;
  rootClassName?: string;
  hasSider?: boolean;
}

defineOptions({ name: 'Layout', inheritAttrs: false, commpatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  hasSider = true,
  style,
  ...others
} = defineProps<BasicProps>();

const { direction } = toRefs(useConfigContextInject());

const siders = ref<string[]>([]);

const passedProps = computed(() => omit(others, ['suffixCls']));

const { getPrefixCls, class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('layout'));
const prefixCls = computed(() => getPrefixCls.value('layout', customizePrefixCls));

const slots = useSlots();

const mergedHasSider = useHasSider(
  siders,
  computed(() => slots.default?.()),
  hasSider,
);

const [hashId, cssVarCls] = useStyle(prefixCls);
const classString = computed(() =>
  clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-has-sider`]: mergedHasSider.value,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    contextClassName?.value,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
  ),
);

const contextValue = computed(() => ({
  siderHook: {
    addSider: (id: string) => {
      siders.value = [...siders.value, id];
    },
    removeSider: (id: string) => {
      siders.value = siders.value.filter((currentId) => currentId !== id);
    },
  },
}));
</script>
<template>
  <LayoutContextProvider :value="contextValue">
    <div :class="classString" :style="{ ...contextStyle, ...style }" v-bind="passedProps">
      <slot></slot>
    </div>
  </LayoutContextProvider>
</template>
