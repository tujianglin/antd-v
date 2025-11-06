<script lang="tsx" setup>
import { Notice } from '@/vc-component/notification';
import type { NoticeProps } from '@/vc-component/notification/Notice.vue';
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import PurePanelStyle from './style/pure-panel';
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, h, toRefs } from 'vue';
import type { PureContentProps } from './PureContent.vue';
import { CloseOutlined } from '@ant-design/icons-vue';
import { getCloseIcon } from './util';
import clsx from 'clsx';
import PureContent from './PureContent.vue';
import type { NotificationSemantic } from './interface';

export type PurePanelClassNamesType = SemanticClassNamesType<PurePanelProps, NotificationSemantic>;

export type PurePanelStylesType = SemanticStylesType<PurePanelProps, NotificationSemantic>;

export interface PurePanelProps
  extends Omit<NoticeProps, 'prefixCls' | 'eventKey' | 'classNames' | 'styles'>,
    Omit<PureContentProps, 'prefixCls' | 'children' | 'classNames' | 'styles'> {
  prefixCls?: string;
  classNames?: PurePanelClassNamesType;
  styles?: PurePanelStylesType;
  closeIcon?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: staticPrefixCls,
  icon,
  type,
  title,
  description,
  actions,
  class: notificationClassName,
  style,
  styles,
  classNames: notificationClassNames,
  closable,
  ...restProps
} = defineProps<PurePanelProps>();

const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('notification'));

const vm = getCurrentInstance() as unknown as { props: PurePanelProps };
const [mergedClassNames, mergedStyles] = useMergeSemantic<PurePanelClassNamesType, PurePanelStylesType, PurePanelProps>(
  computed(() => [contextClassNames?.value, notificationClassNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({ props: vm.props })),
);

const { notification: notificationContext } = toRefs(useConfigContextInject());

const prefixCls = computed(() => staticPrefixCls || getPrefixCls.value('notification'));
const noticePrefixCls = computed(() => `${prefixCls.value}-notice`);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
const [rawClosable, mergedCloseIcon, , ariaProps] = useClosable(
  computed(() => pickClosable(vm.props)),
  computed(() => pickClosable(notificationContext.value)),
  computed(() => ({
    closable: true,
    closeIcon: <CloseOutlined class={`${prefixCls.value}-close-icon`} />,
    closeIconRender: (icon) => getCloseIcon(prefixCls.value, icon),
  })),
);

const mergedClosable = computed<any>(() =>
  rawClosable.value
    ? {
        onClose: closable && typeof closable === 'object' ? closable?.onClose : undefined,
        closeIcon: mergedCloseIcon.value,
        ...ariaProps.value,
      }
    : false,
);
</script>
<template>
  <div
    :class="clsx(`${noticePrefixCls}-pure-panel`, hashId, notificationClassName, cssVarCls, rootCls, mergedClassNames.root)"
    :style="mergedStyles.root"
  >
    <PurePanelStyle :prefix-cls="prefixCls" />
    <Notice
      :style="{ ...contextStyle, ...style }"
      v-bind="restProps"
      :prefix-cls="prefixCls"
      event-key="pure"
      :duration="null"
      :closable="mergedClosable"
      :class="clsx(notificationClassName, contextClassName)"
      :content="() => h(PureContent, { 
        classNames: mergedClassNames as PureContentProps['classNames'] ,
        styles: mergedStyles as PureContentProps['styles'],
        prefixCls: noticePrefixCls,
        icon,
        type,
        title,
        description,
        actions,
      })"
    />
  </div>
</template>
