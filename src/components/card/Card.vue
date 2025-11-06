<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { Tab, TabBarExtraContent } from '@/vc-component/tabs/interface';
import { isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import { computedAsync } from '@vueuse/core';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, getCurrentInstance, nextTick, toRefs, type CSSProperties, type HTMLAttributes, type VNode } from 'vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useVariant from '../form/hooks/useVariants';
import Skeleton from '../skeleton';
import type { TabsProps } from '../tabs';
import Tabs from '../tabs';
import ActionNode from './ActionNode.vue';
import Grid from './Grid.vue';
import useStyle from './style';

export type CardType = 'inner';

export type CardSize = 'default' | 'small';

export interface CardTabListType extends Omit<Tab, 'label'> {
  key: string;
  label: VueNode;
}

type SemanticName = 'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover';

export type CardClassNamesType = SemanticClassNamesType<CardProps, SemanticName>;
export type CardStylesType = SemanticStylesType<CardProps, SemanticName>;

export interface CardProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'title'> {
  prefixCls?: string;
  title?: VueNode;
  extra?: VueNode;
  style?: CSSProperties;
  loading?: boolean;
  hoverable?: boolean;
  id?: string;
  class?: string;
  rootClassName?: string;
  size?: CardSize;
  type?: CardType;
  cover?: VueNode;
  actions?: VueNode[];
  tabList?: CardTabListType[];
  tabBarExtraContent?: TabBarExtraContent;
  onTabChange?: (key: string) => void;
  tabProps?: TabsProps;
  classNames?: CardClassNamesType;
  styles?: CardStylesType;
  variant?: 'borderless' | 'outlined';
}

defineOptions({ name: 'Card', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  extra: customExtra,
  title: customTitle,
  loading,
  variant: customVariant,
  size: customizeSize,
  type,
  cover: customCover,
  actions,
  tabList,
  tabBarExtraContent,
  hoverable,
  tabProps = {},
  classNames,
  styles,
  ...others
} = defineProps<CardProps>();

const slots = defineSlots<{
  default: () => VNode[];
  extra: () => VNode[];
  title: () => VNode[];
  cover: () => VNode[];
}>();

const activeTabKey = defineModel<string>('activeTabKey');

const extra = computed(() => slots.extra || customExtra);
const title = computed(() => slots.title || customTitle);
const cover = computed(() => slots.cover || customCover);

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('card'));
const [variant] = useVariant(
  'card',
  computed(() => customVariant),
);

const onTabChange = (key: string) => {
  others.onTabChange?.(key);
  activeTabKey.value = key;
};

const isContainGrid = computedAsync(async () => {
  await nextTick();
  const children = flattenChildren(slots.default?.()) ?? [];
  return children.some((vnode) => isValidElement(vnode) && (vnode.type as any).__name === Grid.__name);
});

const prefixCls = computed(() => getPrefixCls.value('card', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const extraProps = computed(() => ({
  ...tabProps,
  activeKey: activeTabKey.value,
  tabBarExtraContent,
}));

const mergedSize = useSize(computed(() => customizeSize));

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<CardClassNamesType, CardStylesType, CardProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      variant: variant.value as CardProps['variant'],
      loading,
    },
  })),
);

const tabSize = computed(() => (!mergedSize.value || mergedSize.value === 'default' ? 'large' : mergedSize.value));

const coverClasses = computed(() => clsx(`${prefixCls.value}-cover`, mergedClassNames.value?.cover));

const bodyClasses = computed(() => clsx(`${prefixCls.value}-body`, mergedClassNames.value?.body));

const actionClasses = computed(() => clsx(`${prefixCls.value}-actions`, mergedClassNames.value?.actions));

const divProps = computed(() => omit(others, ['onTabChange']));

const classString = computed(() =>
  clsx(
    prefixCls.value,
    contextClassName?.value,
    {
      [`${prefixCls.value}-loading`]: loading,
      [`${prefixCls.value}-bordered`]: variant?.value !== 'borderless',
      [`${prefixCls.value}-hoverable`]: hoverable,
      [`${prefixCls.value}-contain-grid`]: isContainGrid?.value,
      [`${prefixCls.value}-contain-tabs`]: tabList?.length,
      [`${prefixCls.value}-${mergedSize.value}`]: mergedSize?.value,
      [`${prefixCls.value}-type-${type}`]: !!type,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    mergedClassNames.value?.root,
  ),
);

const mergedStyle = computed(() => ({
  ...mergedStyles?.value?.root,
  ...contextStyle,
  ...style,
}));
</script>
<template>
  <div v-bind="divProps" :class="classString" :style="mergedStyle">
    <div
      v-if="title || extra || tabList"
      :class="clsx(`${prefixCls}-head`, mergedClassNames?.header)"
      :style="mergedStyles.header"
    >
      <div :class="`${prefixCls}-head-wrapper`">
        <div v-if="title" :class="clsx(`${prefixCls}-head-title`, mergedClassNames?.title)" :style="mergedStyles.title">
          <Render :content="title" />
        </div>
        <div v-if="extra" :class="clsx(`${prefixCls}-extra`, mergedClassNames?.extra)" :style="mergedStyles.extra">
          <Render :content="extra" />
        </div>
      </div>
      <Tabs
        v-if="tabList"
        :size="tabSize"
        v-bind="extraProps"
        :class="`${prefixCls}-head-tabs`"
        @change="onTabChange"
        :items="tabList"
      />
    </div>
    <div v-if="cover" :class="coverClasses" :style="mergedStyles.cover">
      <Render :content="cover" />
    </div>
    <div :class="bodyClasses" :style="mergedStyles.body">
      <Skeleton v-if="loading" loading active :paragraph="{ rows: 4 }" :title="false">
        <slot></slot>
      </Skeleton>
      <slot v-else></slot>
    </div>
    <ActionNode v-if="actions?.length" :action-classes="actionClasses" :action-style="mergedStyles.actions" :actions="actions" />
  </div>
</template>
