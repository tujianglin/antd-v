<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { computed, toRefs, type CSSProperties } from 'vue';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import { useComponentConfig } from '../config-provider/context';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import useStyle from './style';
import { useLocale } from '../locale';
import clsx from 'clsx';
import Render from '@/vc-component/render';

defineOptions({ name: 'Empty', inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  class: className,
  rootClassName,
  prefixCls: customizePrefixCls,
  image,
  description,
  style,
  classNames: emptyClassNames,
  styles,
  ...restProps
} = defineProps<EmptyProps>();
const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;

export interface TransferLocale {
  description: string;
}

export type SemanticName = 'root' | 'image' | 'description' | 'footer';
export interface EmptyProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  image?: VueNode;
  description?: VueNode;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}
const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  image: contextImage,
} = toRefs(useComponentConfig('empty'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, emptyClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('empty', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const [locale] = useLocale('Empty');

const des = computed(() => (typeof description !== 'undefined' ? description : locale?.value?.description));
const alt = computed(() => (typeof des.value === 'string' ? des.value : 'empty'));

const mergedImage = computed(() => image ?? contextImage?.value ?? defaultEmptyImg);
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
      {{ des }}
    </div>
    <div v-if="$slots?.default" :class="clsx(`${prefixCls}-footer`, mergedClassNames.footer)" :style="mergedStyles.footer">
      <slot></slot>
    </div>
  </div>
</template>
