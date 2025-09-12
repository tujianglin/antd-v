<script lang="tsx" setup>
import { cloneVNode, computed, getCurrentInstance, ref, useSlots } from 'vue';
import type { BaseInputProps, ValueType } from './interface';
import { hasAddon, hasPrefixSuffix } from './utils/commonUtils';
import Render from '@/components/render/render';
import clsx from 'clsx';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';

export interface HolderRef {
  /** Provider holder ref. Will return `null` if not wrap anything */
  nativeElement: HTMLElement | null;
}

defineOptions({ inheritAttrs: false });

const {
  prefixCls,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  class: className,
  style,
  disabled,
  readonly,
  focused,
  triggerFocus,
  allowClear,
  handleReset,
  hidden,
  classNames,
  dataAttrs,
  styles,
  components,
  onClear,
} = defineProps<BaseInputProps>();

const slots = useSlots();

const value = defineModel<ValueType>('value');

const AffixWrapperComponent = computed(() => components?.affixWrapper || 'span');
const GroupWrapperComponent = computed(() => components?.groupWrapper || 'span');
const WrapperComponent = computed(() => components?.wrapper || 'span');
const GroupAddonComponent = computed(() => components?.groupAddon || 'span');

const containerRef = ref<HTMLDivElement>(null);
const vm = getCurrentInstance();
function onInputClick(e: MouseEvent) {
  if (containerRef.value?.contains(e.target as Element)) {
    triggerFocus?.();
  }
}

const hasAffix = computed(() => hasPrefixSuffix({ prefix, suffix, allowClear }));

defineExpose({
  get nativeElement() {
    return vm.vnode?.el;
  },
});

const Content = computed<any>(() => {
  const children = flattenChildren(slots.default?.())[0];
  let element = cloneVNode(children, {
    class: clsx(!hasAffix.value && classNames?.variant),
  });

  // ================== Prefix & Suffix ================== //
  if (hasAffix.value) {
    // ================== Clear Icon ================== //
    let clearIcon = null;
    if (allowClear) {
      const needClear = !disabled && !readonly && value.value;
      const clearIconCls = `${prefixCls}-clear-icon`;
      const iconNode = typeof allowClear === 'object' && allowClear?.clearIcon ? allowClear.clearIcon : '✖';

      clearIcon = (
        <button
          type="button"
          tabindex={-1}
          onClick={(event) => {
            handleReset?.(event);
            onClear?.();
          }}
          // Do not trigger onBlur when clear input
          // https://github.com/ant-design/ant-design/issues/31200
          onMousedown={(e) => e.preventDefault()}
          class={clsx(clearIconCls, {
            [`${clearIconCls}-hidden`]: !needClear,
            [`${clearIconCls}-has-suffix`]: !!suffix,
          })}
        >
          <Render content={iconNode}></Render>
        </button>
      );
    }
    const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`;
    const affixWrapperCls = clsx(
      affixWrapperPrefixCls,
      {
        [`${prefixCls}-disabled`]: disabled,
        [`${affixWrapperPrefixCls}-disabled`]: disabled, // Not used, but keep it
        [`${affixWrapperPrefixCls}-focused`]: focused, // Not used, but keep it
        [`${affixWrapperPrefixCls}-readonly`]: readonly,
        [`${affixWrapperPrefixCls}-input-with-clear-btn`]: suffix && allowClear,
      },
      classNames?.affixWrapper,
      classNames?.variant,
    );
    const suffixNode = (suffix || allowClear) && (
      <span class={clsx(`${prefixCls}-suffix`, classNames?.suffix)} style={styles?.suffix}>
        <Render content={clearIcon}></Render>
        <Render content={suffix}></Render>
      </span>
    );
    element = (
      <AffixWrapperComponent.value
        class={affixWrapperCls}
        style={styles?.affixWrapper}
        onClick={onInputClick}
        {...dataAttrs?.affixWrapper}
        ref={containerRef}
      >
        {prefix && (
          <span class={clsx(`${prefixCls}-prefix`, classNames?.prefix)} style={styles?.prefix}>
            <Render content={prefix}></Render>
          </span>
        )}
        {element}
        <Render content={suffixNode}> </Render>
      </AffixWrapperComponent.value>
    );
  }

  // ================== Addon ================== //
  if (hasAddon({ addonBefore, addonAfter })) {
    const wrapperCls = `${prefixCls}-group`;
    const addonCls = `${wrapperCls}-addon`;
    const groupWrapperCls = `${wrapperCls}-wrapper`;

    const mergedWrapperClassName = clsx(`${prefixCls}-wrapper`, wrapperCls, classNames?.wrapper);

    const mergedGroupClassName = clsx(
      groupWrapperCls,
      {
        [`${groupWrapperCls}-disabled`]: disabled,
      },
      classNames?.groupWrapper,
    );

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = (
      <GroupWrapperComponent.value class={mergedGroupClassName}>
        <WrapperComponent.value class={mergedWrapperClassName}>
          {addonBefore && (
            <GroupAddonComponent.value class={addonCls}>
              <Render content={addonBefore}></Render>
            </GroupAddonComponent.value>
          )}
          {element}
          {addonAfter && (
            <GroupAddonComponent.value class={addonCls}>
              <Render content={addonAfter}></Render>
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
    :class="clsx(Content?.class, className)"
    :style="{
      ...Content?.style,
      ...style,
    }"
    :hidden="hidden"
  />
</template>
