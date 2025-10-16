<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { Tab, TabBarExtraContent } from '@/vc-component/tabs/interface';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, toRefs, useSlots, type CSSProperties, type HTMLAttributes } from 'vue';
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
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  tabProps?: TabsProps;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  variant?: 'borderless' | 'outlined';
}

type CardClassNamesModule = keyof Exclude<CardProps['classNames'], undefined>;
type CardStylesModule = keyof Exclude<CardProps['styles'], undefined>;

defineOptions({ name: 'Card', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  extra,
  title,
  loading,
  variant: customVariant,
  size: customizeSize,
  type,
  cover,
  actions,
  tabList,
  activeTabKey,
  defaultActiveTabKey,
  tabBarExtraContent,
  hoverable,
  tabProps = {},
  classNames: customClassNames,
  styles: customStyles,
  ...others
} = defineProps<CardProps>();

const slots = useSlots();

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
};

const moduleClass = (moduleName: CardClassNamesModule) =>
  clsx(contextClassNames?.value?.[moduleName], customClassNames?.[moduleName]);

const moduleStyle = (moduleName: CardStylesModule): CSSProperties => ({
  ...contextStyles?.value?.[moduleName],
  ...customStyles?.[moduleName],
});

const isContainGrid = computed(() => {
  const children = slots.default?.() ?? [];
  return children.some((vnode) => vnode.type === Grid);
});

const prefixCls = computed(() => getPrefixCls.value('card', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const hasActiveTabKey = computed(() => activeTabKey !== undefined);
const extraProps = computed(() => ({
  ...tabProps,
  [hasActiveTabKey.value ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey.value ? activeTabKey : defaultActiveTabKey,
  tabBarExtraContent,
}));

const mergedSize = useSize(computed(() => customizeSize));
const tabSize = computed(() => (!mergedSize.value || mergedSize.value === 'default' ? 'large' : mergedSize.value));

const coverClasses = computed(() => clsx(`${prefixCls.value}-cover`, moduleClass('cover')));

const bodyClasses = computed(() => clsx(`${prefixCls.value}-body`, moduleClass('body')));

const actionClasses = computed(() => clsx(`${prefixCls.value}-actions`, moduleClass('actions')));

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
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
    },
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    contextClassNames?.value?.root,
    customClassNames?.root,
  ),
);

const mergedStyle = computed(() => ({
  ...contextStyles?.value?.root,
  ...contextStyle,
  ...customStyles?.root,
  ...style,
}));
</script>
<template>
  <div v-bind="divProps" :class="classString" :style="mergedStyle">
    <div
      v-if="slots.title || slots.extra || title || extra || tabList"
      :class="clsx(`${prefixCls}-head`, moduleClass('header'))"
      :style="moduleStyle('header')"
    >
      <div :class="`${prefixCls}-head-wrapper`">
        <div
          v-if="slots.title || title"
          :class="clsx(`${prefixCls}-head-title`, moduleClass('title'))"
          :style="moduleStyle('title')"
        >
          <slot name="title">
            <Render :content="title" />
          </slot>
        </div>
        <div v-if="slots.extra || extra" :class="clsx(`${prefixCls}-extra`, moduleClass('extra'))" :style="moduleStyle('extra')">
          <slot name="extra">
            <Render :content="extra" />
          </slot>
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
    <div v-if="cover" :class="coverClasses" :style="moduleStyle('cover')">
      <slot name="cover">
        <Render :content="cover" />
      </slot>
    </div>
    <div :class="bodyClasses" :style="moduleStyle('body')">
      <Skeleton v-if="loading" loading active :paragraph="{ rows: 4 }" :title="false">
        <slot></slot>
      </Skeleton>
      <slot v-else></slot>
    </div>
    <ActionNode
      v-if="actions?.length"
      :action-classes="actionClasses"
      :action-style="moduleStyle('actions')"
      :actions="actions"
    />
  </div>
</template>
