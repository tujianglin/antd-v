<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';

export type SemanticName = 'root' | 'section' | 'avatar' | 'title' | 'description';
export type CardMetaClassNamesType = SemanticClassNamesType<CardMetaProps, SemanticName>;
export type CardMetaStylesType = SemanticStylesType<CardMetaProps, SemanticName>;
export interface CardMetaProps {
  prefixCls?: string;
  style?: CSSProperties;
  class?: string;
  avatar?: VueNode;
  title?: VueNode;
  description?: VueNode;
  classNames?: CardMetaClassNamesType;
  styles?: CardMetaStylesType;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  avatar,
  title,
  description,
  style,
  classNames: cardMetaClassNames,
  styles,
  ...restProps
} = defineProps<CardMetaProps>();
const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('cardMeta'));

const prefixCls = computed(() => getPrefixCls.value('card', customizePrefixCls));
const metaPrefixCls = computed(() => `${prefixCls.value}-meta`);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<CardMetaClassNamesType, CardMetaStylesType, CardMetaProps>(
  computed(() => [contextClassNames?.value, cardMetaClassNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({ props: vm.props })),
);

const rootClassNames = computed(() =>
  clsx(metaPrefixCls?.value, className, contextClassName?.value, mergedClassNames.value?.root),
);

const rootStyles = computed(() => ({
  ...contextStyle?.value,
  ...mergedStyles?.value,
  ...style,
}));

const avatarClassNames = computed(() => clsx(`${metaPrefixCls.value}-avatar`, mergedClassNames.value?.avatar));

const titleClassNames = computed(() => clsx(`${metaPrefixCls.value}-title`, mergedClassNames.value?.title));

const descriptionClassNames = computed(() => clsx(`${metaPrefixCls.value}-description`, mergedClassNames.value.description));

const sectionClassNames = computed(() => clsx(`${metaPrefixCls.value}-section`, mergedClassNames.value?.section));
</script>
<template>
  <div v-bind="restProps" :class="rootClassNames" :style="rootStyles">
    <div v-if="avatar" :class="avatarClassNames" :style="mergedStyles?.avatar">
      <Render :content="avatar" />
    </div>
    <div v-if="title || description" :class="sectionClassNames" :style="mergedStyles?.section">
      <div v-if="title" :class="titleClassNames" :style="mergedStyles?.title">
        <Render :content="title" />
      </div>
      <div v-if="description" :class="descriptionClassNames" :style="mergedStyles?.description">
        <Render :content="description" />
      </div>
    </div>
  </div>
</template>
