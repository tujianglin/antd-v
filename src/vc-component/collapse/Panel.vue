<script lang="tsx" setup>
import KeyCode from '@/vc-util/KeyCode';
import { computed, getCurrentInstance, ref } from 'vue';
import type { CollapsePanelProps } from './interface';
import clsx from 'clsx';
import { Render } from '@/components';
import CSSMotion from '@/vc-component/motion';
import PanelContent from './PanelContent.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  showArrow = true,
  headerClass,
  isActive,
  onItemClick,
  forceRender,
  class: className,
  classNames: customizeClassNames = {},
  styles = {},
  prefixCls,
  collapsible,
  accordion,
  panelKey,
  extra,
  header,
  expandIcon,
  openMotion,
  destroyOnHidden,
  children: _,
  ...resetProps
} = defineProps<CollapsePanelProps>();

const disabled = computed(() => collapsible === 'disabled');

const ifExtraExist = computed(() => extra !== null && extra !== undefined && typeof extra !== 'boolean');

const collapsibleProps = computed(() => ({
  onClick: () => {
    onItemClick?.(panelKey);
  },
  onKeydown: (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.keyCode === KeyCode.ENTER || e.which === KeyCode.ENTER) {
      onItemClick?.(panelKey);
    }
  },
  role: accordion ? 'tab' : 'button',
  'aria-expanded': isActive,
  'aria-disabled': disabled.value,
  tabindex: disabled.value ? -1 : 0,
}));

const vm = getCurrentInstance();
// ======================== Icon ========================
const iconNodeInner = computed(() => (typeof expandIcon === 'function' ? expandIcon(vm.props) : <i class="arrow" />));
const iconNode = () => {
  return (
    iconNodeInner.value && (
      <div
        class={clsx(`${prefixCls}-expand-icon`, customizeClassNames?.icon)}
        style={styles?.icon}
        {...(['header', 'icon'].includes(collapsible) ? collapsibleProps : {})}
      >
        <Render content={iconNodeInner.value}></Render>
      </div>
    )
  );
};

const collapsePanelClassNames = computed(() =>
  clsx(
    `${prefixCls}-item`,
    {
      [`${prefixCls}-item-active`]: isActive,
      [`${prefixCls}-item-disabled`]: disabled.value,
    },
    className,
  ),
);

const headerClassName = computed(() =>
  clsx(
    headerClass,
    `${prefixCls}-header`,
    {
      [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible,
    },
    customizeClassNames?.header,
  ),
);

// ======================== HeaderProps ========================
const headerProps = computed(() => ({
  class: headerClassName.value,
  style: styles?.header,
  ...(['header', 'icon'].includes(collapsible) ? {} : collapsibleProps.value),
}));

const domRef = ref(null);
</script>
<template>
  <div v-bind="resetProps" ref="domRef" :class="collapsePanelClassNames">
    <div v-bind="headerProps">
      <Render v-if="showArrow" :content="iconNode" />
      <span
        :class="clsx(`${prefixCls}-title`, customizeClassNames?.title)"
        :style="styles?.title"
        v-bind="collapsible === 'header' ? collapsibleProps : {}"
      >
        <Render :content="header" />
      </span>
      <div v-if="ifExtraExist" :class="`${prefixCls}-extra`">
        <Render :content="extra" />
      </div>
    </div>
    <CSSMotion
      :visible="isActive"
      :leaved-class-name="`${prefixCls}-panel-hidden`"
      v-bind="openMotion"
      :force-render="forceRender"
      :remove-on-leave="destroyOnHidden"
    >
      <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
        <PanelContent
          :ref="motionRef"
          :prefix-cls="prefixCls"
          :class="motionClassName"
          :style="motionStyle"
          :styles="styles"
          :is-active="isActive"
          :force-render="forceRender"
          :role="accordion ? 'tabpanel' : undefined"
        >
          <slot></slot>
        </PanelContent>
      </template>
    </CSSMotion>
  </div>
</template>
