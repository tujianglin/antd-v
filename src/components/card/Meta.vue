<script lang="tsx" setup>
import { computed, toRefs, type CSSProperties } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import Render from '@/vc-component/render';

export type SemanticName = 'root' | 'section' | 'avatar' | 'title' | 'description';
export interface CardMetaProps {
  prefixCls?: string;
  style?: CSSProperties;
  class?: string;
  avatar?: VueNode;
  title?: VueNode;
  description?: VueNode;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
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

const rootClassNames = computed(() =>
  clsx(metaPrefixCls?.value, className, contextClassName?.value, contextClassNames?.value?.root, cardMetaClassNames?.root),
);

const rootStyles = computed(() => ({
  ...contextStyles?.value?.root,
  ...contextStyle?.value,
  ...styles?.root,
  ...style,
}));

const avatarClassNames = computed(() =>
  clsx(`${metaPrefixCls.value}-avatar`, contextClassNames?.value?.avatar, cardMetaClassNames?.avatar),
);

const avatarStyles = computed(() => ({
  ...contextStyles?.value?.avatar,
  ...styles?.avatar,
}));

const titleClassNames = computed(() =>
  clsx(`${metaPrefixCls.value}-title`, contextClassNames?.value?.title, cardMetaClassNames?.title),
);

const titleStyles = computed(() => ({
  ...contextStyles?.value?.title,
  ...styles?.title,
}));

const descriptionClassNames = computed(() =>
  clsx(`${metaPrefixCls.value}-description`, contextClassNames?.value?.description, cardMetaClassNames?.description),
);

const descriptionStyles = computed(() => ({
  ...contextStyles?.value?.description,
  ...styles?.description,
}));

const sectionClassNames = computed(() =>
  clsx(`${metaPrefixCls.value}-section`, contextClassNames?.value?.section, cardMetaClassNames?.section),
);

const sectionStyles = computed(() => ({
  ...contextStyles?.value?.section,
  ...styles?.section,
}));

const AvatarDom = () =>
  avatar ? (
    <div class={avatarClassNames.value} style={avatarStyles.value}>
      <Render content={avatar}></Render>
    </div>
  ) : null;

const TitleDom = () =>
  title ? (
    <div class={titleClassNames.value} style={titleStyles.value}>
      <Render content={title}></Render>
    </div>
  ) : null;

const DescriptionDom = () =>
  description ? (
    <div class={descriptionClassNames.value} style={descriptionStyles.value}>
      <Render content={description}></Render>
    </div>
  ) : null;

const MetaDetail = () =>
  TitleDom() || DescriptionDom() ? (
    <div class={sectionClassNames.value} style={sectionStyles.value}>
      <TitleDom></TitleDom>
      <DescriptionDom></DescriptionDom>
    </div>
  ) : null;
</script>
<template>
  <div v-bind="restProps" :class="rootClassNames" :style="rootStyles">
    <AvatarDom />
    <MetaDetail />
  </div>
</template>
