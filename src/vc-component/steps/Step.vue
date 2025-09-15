<script lang="tsx" setup>
import { computed, toRefs } from 'vue';
import type { Status, StepItem, StepsProps } from './Steps.vue';
import Rail from './Rail.vue';
import StepIcon from './StepIcon.vue';
import { useUnstableContextInject } from './UnstableContext';
import { useStepsContextInject } from './Context';
import { reactiveComputed } from '@vueuse/core';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import { StepIconSemanticContextProvider } from './StepIconContext';
import { Render } from '@/components';

export interface StepProps {
  // style
  prefixCls?: string;
  classNames: StepsProps['classNames'];
  styles: StepsProps['styles'];

  // data
  data: StepItem;
  nextStatus?: Status;
  active?: boolean;
  index: number;
  last: boolean;

  // render
  iconRender?: StepsProps['iconRender'];
  icon?: any;
  itemRender?: StepsProps['itemRender'];
  itemWrapperRender?: StepsProps['itemWrapperRender'];

  // Event
  onClick?: (index: number) => void;
}

const {
  // style
  prefixCls,
  classNames,
  styles,

  // data
  data,
  last,
  nextStatus,
  active,
  index,

  // render
  itemRender,
  iconRender,
  itemWrapperRender,

  // events
  onClick,
} = defineProps<StepProps>();

function hasContent<T>(value: T) {
  return value !== undefined && value !== null;
}

const itemCls = computed(() => `${prefixCls}-item`);

// ======================== Contexts ========================
const { railFollowPrevStatus } = toRefs(useUnstableContextInject());
const { ItemComponent } = toRefs(useStepsContextInject());

// ========================== Data ==========================
const {
  onClick: onItemClick,
  title,
  subTitle,
  content,
  disabled,
  icon,
  status,

  class: className,
  style,
  classNames: itemClassNames,
  styles: itemStyles,

  ...restItemProps
} = toRefs(reactiveComputed(() => data || {}));

const renderInfo = reactiveComputed(() => ({
  item: data,
  index,
  active,
}));

// ========================= Click ==========================
const clickable = computed(() => !!(onClick || onItemClick) && !disabled);

const accessibilityProps = computed(() => {
  const result: {
    role?: string;
    tabindex?: number;
    onClick?: (e: MouseEvent) => void;
    onKeydown?: (e: KeyboardEvent) => void;
  } = {};

  if (clickable.value) {
    result.role = 'button';
    result.tabindex = 0;
    result.onClick = (e) => {
      onItemClick.value?.(e);
      onClick(index);
    };

    result.onKeydown = (e) => {
      const { which } = e;
      if (which === KeyCode.ENTER || which === KeyCode.SPACE) {
        onClick(index);
      }
    };
  }
  return result;
});

// ========================= Render =========================
const mergedStatus = computed(() => status.value || 'wait');

const hasTitle = computed(() => hasContent(title));
const hasSubTitle = computed(() => hasContent(subTitle));

const classString = computed(() =>
  clsx(
    itemCls.value,
    `${itemCls.value}-${mergedStatus.value}`,
    {
      [`${itemCls.value}-custom`]: icon?.value,
      [`${itemCls.value}-active`]: active,
      [`${itemCls.value}-disabled`]: disabled?.value === true,
      [`${itemCls.value}-empty-header`]: !hasTitle.value && !hasSubTitle.value,
    },
    className,
    classNames.item,
    itemClassNames?.value?.root,
  ),
);

const iconNode = () => {
  let result = <StepIcon />;
  if (iconRender) {
    result = iconRender(result, {
      ...renderInfo,
      components: {
        Icon: StepIcon,
      },
    });
  }
  return result;
};

const wrapperNode = () => (
  <div
    class={clsx(`${itemCls.value}-wrapper`, classNames.itemWrapper, itemClassNames?.value?.wrapper)}
    style={{
      ...styles.itemWrapper,
      ...itemStyles?.value?.wrapper,
    }}
  >
    {/* Icon */}
    <StepIconSemanticContextProvider
      value={{
        class: itemClassNames?.value?.icon,
        style: itemStyles?.value?.icon,
      }}
    >
      <Render content={iconNode}></Render>
    </StepIconSemanticContextProvider>

    <div
      class={clsx(`${itemCls.value}-section`, classNames.itemSection, itemClassNames?.value?.section)}
      style={{
        ...styles.itemSection,
        ...itemStyles?.value?.section,
      }}
    >
      <div
        class={clsx(`${itemCls.value}-header`, classNames.itemHeader, itemClassNames?.value?.header)}
        style={{
          ...styles.itemHeader,
          ...itemStyles?.value?.header,
        }}
      >
        {hasTitle.value && (
          <div
            class={clsx(`${itemCls.value}-title`, classNames.itemTitle, itemClassNames?.value?.title)}
            style={{
              ...styles.itemTitle,
              ...itemStyles?.value?.title,
            }}
          >
            <Render content={title.value}></Render>
          </div>
        )}
        {hasSubTitle.value && (
          <div
            title={typeof subTitle.value === 'string' ? subTitle.value : undefined}
            class={clsx(`${itemCls.value}-subtitle`, classNames.itemSubtitle, itemClassNames?.value?.subtitle)}
            style={{
              ...styles.itemSubtitle,
              ...itemStyles?.value?.subtitle,
            }}
          >
            <Render content={subTitle.value}></Render>
          </div>
        )}

        {!last && (
          <Rail
            prefixCls={itemCls.value}
            class={clsx(classNames.itemRail, itemClassNames?.value?.rail)}
            style={{
              ...styles.itemRail,
              ...itemStyles?.value?.rail,
            }}
            status={railFollowPrevStatus?.value ? status.value : nextStatus}
          />
        )}
      </div>
      {hasContent(content?.value) && (
        <div
          class={clsx(`${itemCls.value}-content`, classNames.itemContent, itemClassNames?.value?.content)}
          style={{ ...styles.itemContent, ...itemStyles?.value?.content }}
        >
          <Render content={content?.value}></Render>
        </div>
      )}
    </div>
  </div>
);

const stepNode = () => (
  <ItemComponent.value
    {...restItemProps}
    {...accessibilityProps?.value}
    class={classString.value}
    style={{
      ...styles.item,
      ...itemStyles?.value?.root,
      ...style,
    }}
  >
    <Render content={itemWrapperRender ? itemWrapperRender(wrapperNode) : wrapperNode}></Render>
  </ItemComponent.value>
);
</script>
<template>
  <template v-if="itemRender">
    <Render :content="itemRender(stepNode, renderInfo) || null" />
  </template>
  <Render :content="stepNode" />
</template>
