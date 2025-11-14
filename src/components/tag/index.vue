<script lang="tsx" setup>
import {
  computed,
  getCurrentInstance,
  ref,
  resolveDynamicComponent,
  toRefs,
  useAttrs,
  useSlots,
  type CSSProperties,
  type HTMLAttributes,
} from 'vue';
import type { PresetColorType, PresetStatusColorType } from '../_util/colors';
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import type { LiteralUnion } from '../_util/type';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useColor from './hooks/useColor';
import useStyle from './style';
import PresetCmp from './style/presetCmp';
import StatusCmp from './style/statusCmp';
import type { VueNode } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { omit } from 'es-toolkit/compat';
import clsx from 'clsx';
import { cloneElement, isValidElement, replaceElement } from '@/vc-util/Children/util';
import Render from '@/vc-component/render';
import { Wave } from '../_util/wave';

export type { CheckableTagProps } from './CheckableTag.vue';
export type { CheckableTagGroupProps } from './CheckableTagGroup.vue';

export type TagSemanticName = 'root' | 'icon' | 'content';

export type TagClassNamesType = SemanticClassNamesType<TagProps, TagSemanticName>;
export type TagStylesType = SemanticStylesType<TagProps, TagSemanticName>;
export interface TagProps extends /** @vue-ignore */ HTMLAttributes {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  color?: LiteralUnion<PresetColorType | PresetStatusColorType>;
  variant?: 'filled' | 'solid' | 'outlined';
  closeIcon?: VueNode | boolean;
  onClose?: (e: MouseEvent) => void;
  style?: CSSProperties;
  icon?: VueNode;
  href?: string;
  target?: string;
  disabled?: boolean;
  classNames?: TagClassNamesType;
  styles?: TagStylesType;
}

defineOptions({ name: 'Tag', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  icon,
  color: _,
  onClose,
  disabled: customDisabled = undefined,
  href,
  target,
  styles,
  classNames,
  ...restProps
} = defineProps<TagProps>();

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  variant: contextVariant,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('tag'));

const vm = getCurrentInstance() as { props: TagProps };

// ====================== Colors ======================
const [mergedVariant, mergedColor, isPreset, isStatus, customTagStyle] = useColor(
  reactiveComputed(() => vm.props),
  contextVariant,
);

const isInternalColor = computed(() => isPreset.value || isStatus.value);

// ===================== Disabled =====================
// eslint-disable-next-line vue/no-dupe-keys
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const { tag: tagContext } = toRefs(useConfigContextInject());
const visible = ref(true);

const domProps = computed(() => omit(restProps, ['closeIcon']));

// ====================== Styles ======================
const [mergedClassNames, mergedStyles] = useMergeSemantic<TagClassNamesType, TagStylesType, TagProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      color: mergedColor.value,
      variant: mergedVariant.value,
      disabled: mergedDisabled.value,
      href,
      target,
      icon,
    } as TagProps,
  })),
);

const tagStyle = computed(() => {
  let nextTagStyle: CSSProperties = {
    ...mergedStyles?.value?.root,
    ...contextStyle?.value,
    ...style,
  };

  if (!mergedDisabled.value) {
    nextTagStyle = {
      ...(customTagStyle?.value as any),
      ...nextTagStyle,
    };
  }

  return nextTagStyle;
});

const prefixCls = computed(() => getPrefixCls.value('tag', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const tagClassName = computed(() =>
  clsx(
    prefixCls.value,
    contextClassName?.value,
    mergedClassNames?.value?.root,
    `${prefixCls.value}-${mergedVariant?.value}`,
    {
      [`${prefixCls.value}-${mergedColor?.value}`]: isInternalColor?.value,
      [`${prefixCls.value}-hidden`]: !visible?.value,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-disabled`]: mergedDisabled.value,
    },
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
  ),
);

// ===================== Closable =====================
const handleCloseClick = (e: MouseEvent) => {
  if (mergedDisabled.value) {
    return;
  }
  e.stopPropagation();
  onClose?.(e);

  if (e.defaultPrevented) {
    return;
  }
  visible.value = false;
};

const [, mergedCloseIcon] = useClosable(
  computed(() => pickClosable(vm.props)),
  computed(() => pickClosable(tagContext?.value)),
  computed(() => ({
    closable: false,
    closeIconRender: (iconNode: VueNode | boolean) => {
      const replacement = (
        <span class={`${prefixCls.value}-close-icon`} onClick={handleCloseClick}>
          <Render content={iconNode}></Render>
        </span>
      );
      return replaceElement(iconNode, replacement, (originProps) => ({
        onClick: (e: MouseEvent) => {
          originProps?.onClick?.(e);
          handleCloseClick(e);
        },
        class: clsx(originProps?.class, `${prefixCls.value}-close-icon`),
      }));
    },
  })),
);

// ====================== Render ======================
const slots = useSlots();
const isNeedWave = computed(() => typeof restProps.onClick === 'function' || slots.default?.()?.[0].type === 'a');

const iconNode = computed(() =>
  cloneElement(icon, {
    class: clsx(isValidElement(icon) ? (icon as any).props?.class : '', mergedClassNames?.value?.icon),
    style: mergedStyles?.value?.icon,
  }),
);

const Child = () => {
  return iconNode.value ? (
    <>
      <Render content={iconNode.value}></Render>
      {slots?.default?.() && (
        <span class={mergedClassNames?.value?.content} style={mergedStyles?.value?.content}>
          {slots?.default?.()}
        </span>
      )}
    </>
  ) : (
    <>{slots?.default?.()}</>
  );
};
const attrs = useAttrs();
const TagNode = () => {
  const TagWrapper = resolveDynamicComponent(href ? 'a' : 'span') as any;
  return (
    <TagWrapper
      {...(omit(domProps.value, ['onClick']) as any)}
      {...attrs}
      class={tagClassName.value}
      style={tagStyle.value}
      href={mergedDisabled.value ? undefined : href}
      target={target}
      onClick={mergedDisabled.value ? undefined : domProps.value.onClick}
      {...(href && mergedDisabled.value ? { 'aria-disabled': true } : {})}
    >
      <Child></Child>
      <Render content={mergedCloseIcon.value}></Render>
      {isPreset && <PresetCmp key="preset" prefixCls={prefixCls.value} />}
      {isStatus && <StatusCmp key="status" prefixCls={prefixCls.value} />}
    </TagWrapper>
  );
};
</script>
<template>
  <Wave v-if="isNeedWave" component="Tag">
    <TagNode />
  </Wave>
  <TagNode v-else />
</template>
