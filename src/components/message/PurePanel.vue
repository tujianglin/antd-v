<script lang="tsx" setup>
import { Notice } from '@/vc-component/notification';
import type { NoticeProps } from '@/vc-component/notification/Notice.vue';
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, getCurrentInstance, h, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { ArgsClassNamesType, ArgsStylesType, SemanticName } from './interface';
import type { PureContentProps } from './PureContent.vue';
import PureContent from './PureContent.vue';
import useStyle from './style';

export interface PurePanelProps
  extends Omit<NoticeProps, 'prefixCls' | 'eventKey' | 'classNames' | 'styles'>,
    Omit<PureContentProps, 'prefixCls' | 'children'> {
  prefixCls?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: staticPrefixCls,
  class: className,
  style,
  type,
  icon,
  content,
  classNames: messageClassNames,
  styles,
  ...restProps
} = defineProps<PurePanelProps>();
const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('message'));

const prefixCls = computed(() => staticPrefixCls || getPrefixCls.value('message'));

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<ArgsClassNamesType, ArgsStylesType, PurePanelProps>(
  computed(() => [contextClassNames?.value, messageClassNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: vm.props,
  })),
);
</script>
<template>
  <Notice
    v-bind="restProps"
    :prefix-cls="prefixCls"
    :class="
      clsx(contextClassName, mergedClassNames.root, className, hashId, `${prefixCls}-notice-pure-panel`, cssVarCls, rootCls)
    "
    :style="{ ...mergedStyles?.root, ...contextStyle, ...style }"
    event-key="pure"
    :duration="null"
    :content="
      () =>
        h(
          PureContent,
          {
            prefixCls,
            type,
            icon,
            classNames: mergedClassNames,
            styles: mergedStyles,
          },
          h(Render, { content }),
        )
    "
  />
</template>
