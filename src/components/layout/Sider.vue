<script lang="tsx" setup>
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch, type CSSProperties, type HTMLAttributes } from 'vue';
import { addMediaQueryListener, removeMediaQueryListener } from '../_util/mediaQueryUtil';
import useStyle from './style/sider';
import type { VueNode } from '@/vc-util/type';
import { SiderContextProvider, useLayoutContextInject, type SiderContextProps } from './context';
import { useConfigContextInject } from '../config-provider';
import { omit } from 'lodash-es';
import clsx from 'clsx';
import { BarsOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import Render from '../render';

export type CollapseType = 'clickTrigger' | 'responsive';

export type SiderTheme = 'light' | 'dark';

export interface SiderProps extends /** @vue-ignore */ HTMLAttributes {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  reverseArrow?: boolean;
  onCollapse?: (collapsed: boolean, type: CollapseType) => void;
  zeroWidthTriggerStyle?: CSSProperties;
  trigger?: VueNode;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  theme?: SiderTheme;
  onBreakpoint?: (broken: boolean) => void;
}

export interface SiderState {
  collapsed?: boolean;
  below: boolean;
}

defineOptions({ name: 'Sider', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  trigger,
  defaultCollapsed = false,
  theme = 'dark',
  style = {},
  collapsible = false,
  reverseArrow = false,
  width = 200,
  collapsedWidth = 80,
  zeroWidthTriggerStyle,
  breakpoint,
  onCollapse,
  onBreakpoint,
  ...otherProps
} = defineProps<SiderProps>();

const dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
};

const isNumeric = (value: any) => !Number.isNaN(Number.parseFloat(value)) && isFinite(value);

const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();

const { siderHook } = toRefs(useLayoutContextInject());

const collapsed = ref(otherProps.collapsed || defaultCollapsed);
const below = ref(false);

watch(
  () => otherProps.collapsed,
  (val) => {
    collapsed.value = val;
  },
  { immediate: true },
);

const handleSetCollapsed = (value: boolean, type: CollapseType) => {
  collapsed.value = value;
  onCollapse?.(value, type);
};

// =========================== Prefix ===========================
const { getPrefixCls, direction } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('layout-sider', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

// ========================= Responsive =========================
const responsiveHandlerRef = ref<(mql: MediaQueryListEvent | MediaQueryList) => void>(null);
responsiveHandlerRef.value = (mql: MediaQueryListEvent | MediaQueryList) => {
  below.value = mql.matches;
  onBreakpoint?.(mql.matches);

  if (collapsed.value !== mql.matches) {
    handleSetCollapsed(mql.matches, 'responsive');
  }
};

watch(
  () => breakpoint,
  (_, _1, onCleanup) => {
    function responsiveHandler(mql: MediaQueryListEvent | MediaQueryList) {
      return responsiveHandlerRef.value?.(mql);
    }
    let mql: MediaQueryList;
    if (typeof window?.matchMedia !== 'undefined' && breakpoint && breakpoint in dimensionMaxMap) {
      mql = window.matchMedia(`screen and (max-width: ${dimensionMaxMap[breakpoint]})`);
      addMediaQueryListener(mql, responsiveHandler);
      responsiveHandler(mql);
    }
    onCleanup(() => {
      removeMediaQueryListener(mql, responsiveHandler);
    });
  },
  { immediate: true },
); // in order to accept dynamic 'breakpoint' property, we need to add 'breakpoint' into dependency array.

const uniqueId = generateId('ant-sider-');

onMounted(() => {
  siderHook.value.addSider(uniqueId);
});

onBeforeUnmount(() => {
  siderHook.value.removeSider(uniqueId);
});

const toggle = () => {
  handleSetCollapsed(!collapsed.value, 'clickTrigger');
};

const divProps = computed(() => omit(otherProps, ['collapsed']));
const rawWidth = computed(() => (collapsed.value ? collapsedWidth : width));
// use "px" as fallback unit for width
const siderWidth = computed(() => (isNumeric(rawWidth.value) ? `${rawWidth.value}px` : String(rawWidth.value)));
// special trigger when collapsedWidth == 0
const zeroWidthTrigger = computed(() =>
  parseFloat(String(collapsedWidth || 0)) === 0 ? (
    <span
      onClick={toggle}
      class={clsx(
        `${prefixCls.value}-zero-width-trigger`,
        `${prefixCls.value}-zero-width-trigger-${reverseArrow ? 'right' : 'left'}`,
      )}
      style={zeroWidthTriggerStyle}
    >
      {trigger || <BarsOutlined />}
    </span>
  ) : null,
);

const reverseIcon = computed(() => (direction.value === 'rtl') === !reverseArrow);

const iconObj = computed(() => ({
  expanded: reverseIcon.value ? <RightOutlined /> : <LeftOutlined />,
  collapsed: reverseIcon.value ? <LeftOutlined /> : <RightOutlined />,
}));

const status = computed(() => (collapsed.value ? 'collapsed' : 'expanded'));
const defaultTrigger = computed(() => iconObj.value[status.value]);
const triggerDom = computed(() =>
  trigger !== null
    ? zeroWidthTrigger.value || (
        <div class={`${prefixCls.value}-trigger`} onClick={toggle} style={{ width: siderWidth.value }}>
          {trigger || defaultTrigger.value}
        </div>
      )
    : null,
);

const divStyle = computed(() => ({
  ...style,
  flex: `0 0 ${siderWidth.value}`,
  maxWidth: siderWidth.value, // Fix width transition bug in IE11
  minWidth: siderWidth.value, // https://github.com/ant-design/ant-design/issues/6349
  width: siderWidth.value,
}));

const siderCls = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-${theme}`,
    {
      [`${prefixCls.value}-collapsed`]: !!collapsed.value,
      [`${prefixCls.value}-has-trigger`]: collapsible.valueOf && trigger !== null && !zeroWidthTrigger.value,
      [`${prefixCls.value}-below`]: !!below.value,
      [`${prefixCls.value}-zero-width`]: parseFloat(siderWidth.value) === 0,
    },
    className,
    hashId.value,
    cssVarCls.value,
  ),
);

const contextValue = computed<SiderContextProps>(() => ({ siderCollapsed: collapsed.value }));
</script>
<template>
  <SiderContextProvider :value="contextValue">
    <aside :class="siderCls" v-bind="{ ...divProps, ...$attrs }" :style="divStyle">
      <div :class="`${prefixCls}-children`">
        <slot></slot>
      </div>
      <Render :content="collapsed || (below && zeroWidthTrigger) ? triggerDom : null" />
    </aside>
  </SiderContextProvider>
</template>
