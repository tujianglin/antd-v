<script lang="tsx" setup>
import { useNotification as useRcNotification } from '@/vc-component/notification';
import clsx from 'clsx';
import { computed, defineComponent, toRefs } from 'vue';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import type { ConfigOptions } from './interface';
import { getMotion } from './util';
import type { NotificationAPI, NotificationConfig as RcNotificationConfig } from '@/vc-component/notification';
import { NotificationContextProvider } from '@/vc-component/notification/NotificationProvider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import type { MessageConfig } from '../config-provider/context';
import { reactiveComputed } from '@vueuse/core';

export interface HolderRef {
  prefixCls: string;
  message?: MessageConfig;
  api?: NotificationAPI;
}

// ==============================================================================
// ==                                  Holder                                  ==
// ==============================================================================
type HolderProps = ConfigOptions & {
  onAllRemoved?: VoidFunction;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  top,
  prefixCls: staticPrefixCls,
  getContainer: staticGetContainer,
  maxCount,
  duration = 3,
  rtl,
  transitionName,
  onAllRemoved,
  pauseOnHover = true,
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

const DEFAULT_OFFSET = 8;
const { getPrefixCls, getPopupContainer, direction } = toRefs(useComponentConfig('message'));
const { message } = toRefs(useConfigContextInject());

const prefixCls = computed(() => staticPrefixCls || getPrefixCls.value('message'));

// =============================== Style ===============================
const getStyle = () => ({
  left: '50%',
  transform: 'translateX(-50%)',
  top: `${top ?? DEFAULT_OFFSET}px`,
});
const getClassName = () => clsx({ [`${prefixCls.value}-rtl`]: rtl ?? direction?.value === 'rtl' });

// ============================== Motion ===============================
const getNotificationMotion = () => getMotion(prefixCls.value, transitionName);

// ============================== Origin ===============================
const [api, Holder] = useRcNotification(
  reactiveComputed(() => ({
    prefixCls: prefixCls.value,
    style: getStyle,
    class: getClassName,
    motion: getNotificationMotion,

    // closable=false requires-no closeIcon
    closable: false,
    duration,
    getContainer: () => staticGetContainer?.() || getPopupContainer.value?.() || document.body,
    maxCount,
    onAllRemoved,
    renderNotifications,
    pauseOnHover,
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
  get message() {
    return message?.value;
  },
});
</script>
<template>
  <Holder />
</template>
