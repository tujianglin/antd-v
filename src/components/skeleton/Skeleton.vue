<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import type { AvatarProps } from './Avatar.vue';
import Element from './Element.vue';
import type { SkeletonParagraphProps } from './Paragraph.vue';
import Paragraph from './Paragraph.vue';
import useStyle from './style';
import type { SkeletonTitleProps } from './Title.vue';
import Title from './Title.vue';

/* This only for skeleton internal. */
type SkeletonAvatarProps = Omit<AvatarProps, 'active'>;

export type SemanticName = 'root' | 'header' | 'section' | 'avatar' | 'title' | 'paragraph';

export type SkeletonClassNamesType = SemanticClassNamesType<SkeletonProps, SemanticName>;

export type SkeletonStylesType = SemanticStylesType<SkeletonProps, SemanticName>;

export interface SkeletonProps {
  active?: boolean;
  loading?: boolean;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  avatar?: SkeletonAvatarProps | boolean;
  title?: SkeletonTitleProps | boolean;
  paragraph?: SkeletonParagraphProps | boolean;
  round?: boolean;
  classNames?: Record<SemanticName, string>;
  styles?: Record<SemanticName, CSSProperties>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
// Tips: ctx.classNames.root < ctx.className < cpns.classNames.root < cpns.className < rootClassName
const {
  prefixCls: customizePrefixCls,
  loading = true,
  class: className,
  rootClassName,
  classNames,
  style,
  styles,
  avatar = false,
  title = true,
  paragraph = true,
  active,
  round,
} = defineProps<SkeletonProps>();

function getComponentProps<T>(prop?: T | boolean): T | Record<string, string> {
  if (prop && typeof prop === 'object') {
    return prop;
  }
  return {};
}

function getAvatarBasicProps(hasTitle: boolean, hasParagraph: boolean): SkeletonAvatarProps {
  if (hasTitle && !hasParagraph) {
    // Square avatar
    return { size: 'large', shape: 'square' };
  }

  return { size: 'large', shape: 'circle' };
}

function getTitleBasicProps(hasAvatar: boolean, hasParagraph: boolean): SkeletonTitleProps {
  if (!hasAvatar && hasParagraph) {
    return { width: '38%' };
  }

  if (hasAvatar && hasParagraph) {
    return { width: '50%' };
  }

  return {};
}

function getParagraphBasicProps(hasAvatar: boolean, hasTitle: boolean): SkeletonParagraphProps {
  const basicProps: SkeletonParagraphProps = {};

  // Width
  if (!hasAvatar || !hasTitle) {
    basicProps.width = '61%';
  }

  // Rows
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }

  return basicProps;
}

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('skeleton'));
const prefixCls = computed(() => getPrefixCls.value('skeleton', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<SkeletonClassNamesType, SkeletonStylesType, SkeletonProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      avatar,
      title,
      paragraph,
    },
  })),
);
</script>
<template>
  <div
    v-if="loading"
    :class="
      clsx(
        prefixCls,
        {
          [`${prefixCls}-with-avatar`]: !!avatar,
          [`${prefixCls}-active`]: active,
          [`${prefixCls}-rtl`]: direction === 'rtl',
          [`${prefixCls}-round`]: round,
        },
        mergedClassNames?.root,
        contextClassName,
        className,
        rootClassName,
        hashId,
        cssVarCls,
      )
    "
    :style="{ ...contextStyles.root, ...contextStyle, ...styles?.root, ...style }"
  >
    <div v-if="!!avatar" :class="clsx(mergedClassNames?.header, `${prefixCls}-header`)" :style="mergedStyles?.header">
      <Element
        :class="clsx(mergedClassNames?.avatar)"
        :prefix-cls="`${prefixCls}-avatar`"
        v-bind="{ ...getAvatarBasicProps(!!title, !!paragraph), ...getComponentProps(avatar) }"
        :style="mergedStyles?.avatar"
      />
    </div>
    <div
      v-if="!!title || !!paragraph"
      :class="clsx(mergedClassNames?.section, `${prefixCls}-section`)"
      :style="mergedStyles?.section"
    >
      <Title
        v-if="!!title"
        :class="clsx(mergedClassNames?.title)"
        :prefix-cls="`${prefixCls}-title`"
        v-bind="{ ...getTitleBasicProps(!!avatar, !!paragraph), ...getComponentProps(title) }"
        :style="mergedStyles?.title"
      />
      <Paragraph
        v-if="!!paragraph"
        :class="clsx(mergedClassNames?.paragraph)"
        :prefix-cls="`${prefixCls}-paragraph`"
        v-bind="{ ...getParagraphBasicProps(!!avatar, !!title), ...getComponentProps(paragraph) }"
        :style="mergedStyles.paragraph"
      />
    </div>
  </div>
  <slot v-else></slot>
</template>
