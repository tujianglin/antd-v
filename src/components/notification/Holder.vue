<script lang="tsx" setup>
import { useNotification as useRcNotification } from '@/vc-component/notification';
import clsx from 'clsx';
import { computed, defineComponent, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import { useToken } from '../theme/internal';
import type {
  NotificationClassNamesType,
  NotificationConfig,
  NotificationPlacement,
  NotificationSemantic,
  NotificationStylesType,
} from './interface';
import { getCloseIcon, getMotion, getPlacementStyle } from './util';
import type { NotificationAPI, NotificationConfig as RcNotificationConfig } from '@/vc-component/notification';
import { NotificationContextProvider } from '@/vc-component/notification/NotificationProvider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import type { NotificationConfig as CPNotificationConfig } from '../config-provider/context';
import { reactiveComputed } from '@vueuse/core';
import { useMergeSemantic, type SemanticClassNames, type SemanticStyles } from '../_util/hooks';

export interface HolderRef {
  prefixCls: string;
  notification?: CPNotificationConfig;
  api?: NotificationAPI;
  classNames: SemanticClassNames<NotificationSemantic>;
  styles: SemanticStyles<NotificationSemantic>;
}

// ==============================================================================
// ==                                  Holder                                  ==
// ==============================================================================
type HolderProps = NotificationConfig & {
  onAllRemoved?: VoidFunction;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  top,
  bottom,
  prefixCls: staticPrefixCls,
  getContainer: staticGetContainer,
  maxCount,
  rtl,
  onAllRemoved,
  stack = true,
  duration,
  pauseOnHover = true,
  showProgress,
  classNames,
  styles,
} = defineProps<HolderProps>();

const Wrapper = defineComponent({
  props: ['prefixCls'],
  setup(props, { slots }) {
    const { prefixCls } = toRefs(props);
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
    return () => (
      <NotificationContextProvider value={{ classNames: { list: clsx(hashId.value, cssVarCls.value, rootCls.value) } }}>
        {slots.default?.()}
      </NotificationContextProvider>
    );
  },
});

const renderNotifications: RcNotificationConfig['renderNotifications'] = (node, { prefixCls, key }) => (
  <Wrapper prefixCls={prefixCls} key={key}>
    {node}
  </Wrapper>
);

const DEFAULT_OFFSET = 24;
const DEFAULT_DURATION = 4.5;
const { getPrefixCls, getPopupContainer, direction } = toRefs(useComponentConfig('notification'));
const { notification } = toRefs(useConfigContextInject());
const [, token] = useToken();

const prefixCls = computed(() => staticPrefixCls || getPrefixCls.value('notification'));

// =============================== Style ===============================
const getStyle = (placement: NotificationPlacement): CSSProperties =>
  getPlacementStyle(placement, top ?? DEFAULT_OFFSET, bottom ?? DEFAULT_OFFSET);

const getClassName = () => clsx({ [`${prefixCls.value}-rtl`]: rtl ?? direction?.value === 'rtl' });

// ============================== Motion ===============================
const getNotificationMotion = () => getMotion(prefixCls.value);

// ============================== Origin ===============================
const [api, Holder] = useRcNotification(
  reactiveComputed(() => ({
    prefixCls: prefixCls.value,
    style: getStyle,
    class: getClassName,
    motion: getNotificationMotion,
    closable: { closeIcon: getCloseIcon(prefixCls.value) },
    duration: duration ?? DEFAULT_DURATION,
    getContainer: () => staticGetContainer?.() || getPopupContainer.value?.() || document.body,
    maxCount,
    pauseOnHover,
    showProgress,
    onAllRemoved,
    renderNotifications,
    stack:
      stack === false
        ? false
        : {
            threshold: typeof stack === 'object' ? stack?.threshold : undefined,
            offset: 8,
            gap: token.value.margin,
          },
  })),
);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<NotificationClassNamesType, NotificationStylesType, HolderProps>(
  computed(() => [notification?.value?.classNames, classNames]),
  computed(() => [notification?.value?.styles, styles]),
  computed(() => ({
    props: vm.props,
  })),
);

// ================================ Ref ================================
defineExpose({
  get api() {
    return api.value;
  },
  get prefixCls() {
    return prefixCls.value;
  },
  get notification() {
    return notification?.value;
  },
  get classNames() {
    return mergedClassNames.value;
  },
  get styles() {
    return mergedStyles.value;
  },
});
</script>
<template>
  <Holder />
</template>
