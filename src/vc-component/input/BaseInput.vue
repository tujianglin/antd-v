<script lang="tsx" setup>
import { cloneVNode, computed, ref, useAttrs, useSlots } from 'vue';
import type { BaseInputProps } from './interface';
import { hasAddon, hasPrefixSuffix } from './utils/commonUtils';
import { cn } from '@/utils/cn';
import Render from '@/components/render/render';
import { reactiveComputed } from '@vueuse/core';
defineOptions({ inheritAttrs: false });

const props = defineProps<BaseInputProps>();
const attrs = useAttrs();

const bindProps = reactiveComputed(() => ({ ...props, ...attrs }) as BaseInputProps);
const slots = useSlots();

// const value = defineModel('value');

const AffixWrapperComponent = computed(() => bindProps.components?.affixWrapper || 'span');
const GroupWrapperComponent = computed(() => bindProps.components?.groupWrapper || 'span');
const WrapperComponent = computed(() => bindProps.components?.wrapper || 'span');
const GroupAddonComponent = computed(() => bindProps.components?.groupAddon || 'span');

const containerRef = ref<HTMLDivElement>(null);

function onInputClick(e: MouseEvent) {
  if (containerRef.value?.contains(e.target as Element)) {
    bindProps.triggerFocus?.();
  }
}

const hasAffix = computed(() => hasPrefixSuffix(bindProps));

const groupRef = ref<HTMLDivElement>(null);

const Content = computed(() => {
  let element: any = cloneVNode(slots.default?.()[0], {
    class: cn(bindProps.class, !hasAffix.value && bindProps.classNames.variant),
  });

  // ================== Prefix & Suffix ================== //
  if (hasAffix.value) {
    // ================== Clear Icon ================== //
    let clearIcon = null;
    if (bindProps.allowClear) {
      const needClear = !bindProps.disabled && !bindProps.readOnly;
      const clearIconCls = `${bindProps.prefixCls}-clear-icon`;
      const iconNode =
        typeof bindProps.allowClear === 'object' && bindProps.allowClear?.clearIcon ? bindProps.allowClear.clearIcon : '✖';

      clearIcon = (
        <button
          type="button"
          tabindex={-1}
          onClick={(event) => {
            bindProps.handleReset?.(event);
            bindProps.onClear?.();
          }}
          // Do not trigger onBlur when clear input
          // https://github.com/ant-design/ant-design/issues/31200
          onMousedown={(e) => e.preventDefault()}
          class={cn(clearIconCls, {
            [`${clearIconCls}-hidden`]: !needClear,
            [`${clearIconCls}-has-suffix`]: !!bindProps.suffix,
          })}
        >
          <Render content={iconNode}></Render>
        </button>
      );
    }
    const affixWrapperPrefixCls = `${bindProps.prefixCls}-affix-wrapper`;
    const affixWrapperCls = cn(
      affixWrapperPrefixCls,
      {
        [`${bindProps.prefixCls}-disabled`]: bindProps.disabled,
        [`${affixWrapperPrefixCls}-disabled`]: bindProps.disabled, // Not used, but keep it
        [`${affixWrapperPrefixCls}-focused`]: bindProps.focused, // Not used, but keep it
        [`${affixWrapperPrefixCls}-readonly`]: bindProps.readOnly,
        [`${affixWrapperPrefixCls}-input-with-clear-btn`]: bindProps.suffix && bindProps.allowClear,
      },
      bindProps.classNames?.affixWrapper,
      bindProps.classNames?.variant,
    );
    const suffixNode = (bindProps.suffix || bindProps.allowClear) && (
      <span class={cn(`${bindProps.prefixCls}-suffix`, bindProps.classNames?.suffix)} style={bindProps.styles?.suffix}>
        <Render content={clearIcon}></Render>
        <Render content={bindProps.suffix}></Render>
      </span>
    );
    element = (
      <AffixWrapperComponent.value
        class={affixWrapperCls}
        style={bindProps.styles?.affixWrapper}
        onClick={onInputClick}
        {...bindProps.dataAttrs?.affixWrapper}
        ref={containerRef}
      >
        {bindProps.prefix && (
          <span class={cn(`${bindProps.prefixCls}-prefix`, bindProps.classNames?.prefix)} style={bindProps.styles?.prefix}>
            <Render content={bindProps.prefix}></Render>
          </span>
        )}
        {element}
        <Render content={suffixNode}> </Render>
      </AffixWrapperComponent.value>
    );
  }

  // ================== Addon ================== //
  if (hasAddon(props)) {
    const wrapperCls = `${bindProps.prefixCls}-group`;
    const addonCls = `${wrapperCls}-addon`;
    const groupWrapperCls = `${wrapperCls}-wrapper`;

    const mergedWrapperClassName = cn(`${bindProps.prefixCls}-wrapper`, wrapperCls, bindProps.classNames?.wrapper);

    const mergedGroupClassName = cn(
      groupWrapperCls,
      {
        [`${groupWrapperCls}-disabled`]: bindProps.disabled,
      },
      bindProps.classNames?.groupWrapper,
    );

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = (
      <GroupWrapperComponent.value class={mergedGroupClassName} ref={groupRef}>
        <WrapperComponent.value class={mergedWrapperClassName}>
          {bindProps.addonBefore && (
            <GroupAddonComponent.value class={addonCls}>
              <Render content={bindProps.addonBefore}></Render>
            </GroupAddonComponent.value>
          )}
          {element}
          {bindProps.addonAfter && (
            <GroupAddonComponent.value class={addonCls}>
              <Render content={bindProps.addonAfter}></Render>
            </GroupAddonComponent.value>
          )}
        </WrapperComponent.value>
      </GroupWrapperComponent.value>
    );
  }

  return element;
});
</script>
<template>
  <component
    :is="Content"
    :class="cn(Content?.class, props.class)"
    :style="{
      ...Content?.style,
      ...props.style,
    }"
  />
</template>
