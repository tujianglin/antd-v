<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, toRefs, type CSSProperties, type VNode } from 'vue';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import { useComponentConfig } from '../config-provider/context';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import useStyle from './style';
import { useLocale } from '../locale';
import clsx from 'clsx';
import Render from '@/vc-component/render';

export interface TransferLocale {
  description: string;
}

export type EmptySemanticName = 'root' | 'image' | 'description' | 'footer';

export type EmptyClassNamesType = SemanticClassNamesType<EmptyProps, EmptySemanticName>;
export type EmptyStylesType = SemanticStylesType<EmptyProps, EmptySemanticName>;
export interface EmptyProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  image?: VueNode;
  description?: boolean | VueNode;
  classNames?: EmptyClassNamesType;
  styles?: EmptyStylesType;
}

defineOptions({ name: 'Empty', inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  class: className,
  rootClassName,
  prefixCls: customizePrefixCls,
  image: customImage,
  description: customDescription = undefined,
  style,
  classNames: emptyClassNames,
  styles,
  ...restProps
} = defineProps<EmptyProps>();

const slots = defineSlots<{
  default?: () => VNode[];
  image?: () => VNode[];
  description?: () => VNode[];
}>();

const description = computed(() => slots.description || customDescription);
const image = computed(() => slots.image || customImage);

const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  image: contextImage,
} = toRefs(useComponentConfig('empty'));

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<EmptyClassNamesType, EmptyStylesType, EmptyProps>(
  computed(() => [contextClassNames?.value, emptyClassNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({ props: vm.props })),
);

const prefixCls = computed(() => getPrefixCls.value('empty', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const [locale] = useLocale('Empty');

const des = computed(() => (description.value === false ? '' : description.value || locale?.value?.description));
const alt = computed(() => (typeof des.value === 'string' ? des.value : 'empty'));

const mergedImage = computed(() => image.value ?? contextImage?.value ?? defaultEmptyImg);
</script>
<template>
  <div
    v-bind="restProps"
    :class="
      clsx(
        hashId,
        cssVarCls,
        prefixCls,
        contextClassName,
        {
          [`${prefixCls}-normal`]: mergedImage === simpleEmptyImg,
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        className,
        rootClassName,
        mergedClassNames.root,
      )
    "
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
  >
    <div :class="clsx(`${prefixCls}-image`, mergedClassNames.image)" :style="mergedStyles.image">
      <img v-if="typeof mergedImage === 'string'" :src="mergedImage" :alt="alt" />
      <Render v-else :content="mergedImage" />
    </div>
    <div v-if="des" :class="clsx(`${prefixCls}-description`, mergedClassNames.description)" :style="mergedStyles.description">
      <Render :content="des" />
    </div>
    <div v-if="slots?.default" :class="clsx(`${prefixCls}-footer`, mergedClassNames.footer)" :style="mergedStyles.footer">
      <slot></slot>
    </div>
  </div>
</template>
