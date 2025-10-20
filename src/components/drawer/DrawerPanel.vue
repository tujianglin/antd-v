<script lang="tsx" setup>
import type { DrawerProps as RCDrawerProps } from '@/vc-component/drawer';
import type { ClosableType } from '../_util/hooks/useClosable';
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useComponentConfig } from '../config-provider/context';
import { computed, getCurrentInstance, toRefs, type CSSProperties, type VNode } from 'vue';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import Skeleton from '../skeleton';

export type SemanticName = 'root' | 'mask' | 'header' | 'title' | 'extra' | 'section' | 'body' | 'footer' | 'wrapper' | 'dragger';

export type DrawerClassNames = Partial<Record<SemanticName, string>>;

export type DrawerStyles = Partial<Record<SemanticName, CSSProperties>>;

export interface DrawerPanelProps {
  prefixCls: string;

  title?: VueNode;
  footer?: VueNode;
  extra?: VueNode;
  /**
   * Recommend to use closeIcon instead
   *
   * e.g.
   *
   * `<Drawer closeIcon={false} />`
   */
  closable?:
    | boolean
    | (Extract<ClosableType, object> & {
        placement?: 'start' | 'end';
      });
  closeIcon?: VueNode;
  onClose?: RCDrawerProps['onClose'];

  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
  loading?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  prefixCls,
  title,
  footer: footerRender,
  extra: extraRender,
  closable,
  loading,
  onClose,
  classNames: drawerClassNames,
  styles: drawerStyles,
} = defineProps<DrawerPanelProps>();

const slots = defineSlots<{
  footer: () => VNode[];
  extra: () => VNode[];
}>();

const footer = computed(() => slots.footer || footerRender);
const extra = computed(() => slots.extra || extraRender);

const drawerContext = useComponentConfig('drawer');

const { classNames: contextClassNames, styles: contextStyles } = toRefs(drawerContext);

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, drawerClassNames]),
  computed(() => [contextStyles?.value, drawerStyles]),
);

const closablePlacement = computed(() => {
  let result;
  if (closable === false) {
    result = undefined;
  } else if (closable === undefined || closable === true) {
    result = 'start';
  } else {
    result = closable?.placement === 'end' ? 'end' : 'start';
  }
  return result;
});

const customCloseIconRender = (icon: VueNode) => (
  <button
    type="button"
    onClick={onClose}
    class={clsx(`${prefixCls}-close`, {
      [`${prefixCls}-close-${closablePlacement.value}`]: closablePlacement.value === 'end',
    })}
  >
    <Render content={icon}></Render>
  </button>
);

const vm = getCurrentInstance();

const [mergedClosable, mergedCloseIcon] = useClosable(
  computed(() => pickClosable(vm.props)),
  computed(() => pickClosable(drawerContext as any)),
  computed(() => ({
    closable: true,
    closeIconRender: customCloseIconRender as any,
  })),
);
</script>
<template>
  <div
    v-if="title || mergedClosable"
    :style="mergedStyles.header"
    :class="
      clsx(`${prefixCls}-header`, mergedClassNames.header, {
        [`${prefixCls}-header-close-only`]: mergedClosable && !title && !extra,
      })
    "
  >
    <div :class="`${prefixCls}-header-title`">
      <Render v-if="closablePlacement === 'start'" :content="mergedCloseIcon" />
      <div v-if="title" :class="clsx(`${prefixCls}-title`, mergedClassNames.title)" :style="mergedStyles.title">
        <Render :content="title" />
      </div>
    </div>
    <div v-if="extra" :class="clsx(`${prefixCls}-extra`, mergedClassNames.extra)" :style="mergedStyles.extra">
      <Render :content="extra" />
    </div>
    <Render v-if="closablePlacement === 'end'" :content="mergedCloseIcon" />
  </div>
  <div :class="clsx(`${prefixCls}-body`, mergedClassNames.body)" :style="mergedStyles.body">
    <Skeleton v-if="loading" active :title="false" :paragraph="{ rows: 5 }" :class="`${prefixCls}-body-skeleton`" />
    <slot v-else></slot>
  </div>
  <div v-if="footer" :class="clsx(`${prefixCls}-footer`, mergedClassNames.footer)" :style="mergedStyles.footer">
    <Render :content="footer" />
  </div>
</template>
