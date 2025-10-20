<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, Fragment, resolveDynamicComponent, toRefs, type CSSProperties } from 'vue';
import { devUseWarning } from '../_util/warning';
import { useConfigContextInject } from '../config-provider';
import useMessage from '../message/useMessage';
import useModal from '../modal/useModal';
import useNotification from '../notification/useNotification';
import {
  AppConfigContextProvider,
  AppContextProvider,
  useAppConfigContextInject,
  type AppConfig,
  type useAppProps,
} from './context';
import useStyle from './style';

export interface AppProps extends AppConfig {
  style?: CSSProperties;
  class?: string;
  rootClassName?: string;
  prefixCls?: string;
  component?: any;
}

defineOptions({ name: 'App', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  message,
  notification,
  style,
  component = 'div',
} = defineProps<AppProps>();
const { direction, getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('app', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

const customClassName = computed(() =>
  clsx(hashId.value, prefixCls.value, className, rootClassName, cssVarCls.value, {
    [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
  }),
);

const appConfig = useAppConfigContextInject();

const mergedAppConfig = computed<AppConfig>(() => ({
  message: { ...appConfig.message, ...message },
  notification: { ...appConfig.notification, ...notification },
}));

const [messageApi, MessageContextHolder] = useMessage(mergedAppConfig.value.message);
const [notificationApi, NotificationContextHolder] = useNotification(mergedAppConfig.value.notification);
const [ModalApi, ModalContextHolder] = useModal();

const memoizedContextValue = computed<useAppProps>(() => ({
  message: messageApi,
  notification: notificationApi,
  modal: ModalApi,
}));

// https://github.com/ant-design/ant-design/issues/48802#issuecomment-2097813526
devUseWarning('App')(
  !(cssVarCls && component === false),
  'usage',
  'When using cssVar, ensure `component` is assigned a valid React component string.',
);

// ============================ Render ============================
const Dynamic = computed(() => resolveDynamicComponent(component === false ? Fragment : component));

const rootProps = computed<AppProps>(() => ({
  class: customClassName.value,
  style,
}));
</script>
<template>
  <AppContextProvider :value="memoizedContextValue">
    <AppConfigContextProvider :value="{ ...mergedAppConfig }">
      <Dynamic v-bind="{ ...(component === false ? undefined : rootProps) }">
        <ModalContextHolder />
        <MessageContextHolder />
        <NotificationContextHolder />
        <slot></slot>
      </Dynamic>
    </AppConfigContextProvider>
  </AppContextProvider>
</template>
