import type { VueKey } from '@/vc-util/type';
import { computed, createVNode, defineComponent, onMounted, ref, render, toRefs, type PropType } from 'vue';
import { useAppConfigContextInject } from '../app/context';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import { globalConfig } from '../config-provider/global';
import type { ArgsProps, GlobalConfigProps, NotificationInstance } from './interface';
import PurePanel from './PurePanel.vue';
import useNotification, { useInternalNotification } from './useNotification';

export type { ArgsProps };

let notification: GlobalNotification | null = null;

let act: (callback: VoidFunction) => Promise<void> | void = (callback: VoidFunction) => callback();

interface GlobalNotification {
  fragment: DocumentFragment;
  instance?: NotificationInstance | null;
  sync?: VoidFunction;
}

type Task =
  | {
      type: 'open';
      config: ArgsProps;
    }
  | {
      type: 'destroy';
      key?: VueKey;
    };

let taskQueue: Task[] = [];

let defaultGlobalConfig: GlobalConfigProps = {};

function getGlobalContext() {
  const { getContainer, rtl, maxCount, top, bottom, showProgress, pauseOnHover } = defaultGlobalConfig;
  const mergedContainer = getContainer?.() || document.body;

  return {
    getContainer: () => mergedContainer,
    rtl,
    maxCount,
    top,
    bottom,
    showProgress,
    pauseOnHover,
  };
}

export interface GlobalHolderRef {
  instance: () => NotificationInstance;
  sync: () => void;
}

const GlobalHolder = defineComponent({
  props: {
    notificationConfig: Object as PropType<GlobalConfigProps>,
    sync: Function as PropType<() => void>,
  },
  setup(props, { expose }) {
    const { notificationConfig, sync } = toRefs(props);

    const { getPrefixCls } = toRefs(useConfigContextInject());
    const prefixCls = computed(() => defaultGlobalConfig.prefixCls || getPrefixCls.value('notification'));
    const appConfig = useAppConfigContextInject();

    const [api, Holder] = useInternalNotification({
      ...notificationConfig.value,
      prefixCls: prefixCls.value,
      ...appConfig.notification,
    });

    onMounted(() => {
      sync?.value?.();
    });

    expose({
      get instance() {
        const instance: NotificationInstance = { ...api };

        Object.keys(instance).forEach((method) => {
          instance[method as keyof NotificationInstance] = (...args: any[]) => {
            sync.value?.();
            return (api as any)[method](...args);
          };
        });
        return instance;
      },
      sync: sync.value,
    });

    return () => <Holder></Holder>;
  },
});

const GlobalHolderWrapper = defineComponent({
  setup(_, { expose }) {
    const domRef = ref<any>(null);
    const notificationConfig = ref<GlobalConfigProps>(getGlobalContext());

    const sync = () => {
      notificationConfig.value = getGlobalContext();
    };

    onMounted(() => {
      sync?.();
    });

    const global = globalConfig();
    const rootPrefixCls = global.getRootPrefixCls();
    const rootIconPrefixCls = global.getIconPrefixCls();
    const theme = global.getTheme();

    expose({
      get el() {
        return domRef.value;
      },
    });

    return () => {
      const dom = <GlobalHolder ref={domRef} sync={sync} notificationConfig={notificationConfig.value as any} />;

      return (
        <ConfigProvider prefixCls={rootPrefixCls} iconPrefixCls={rootIconPrefixCls} theme={theme}>
          {global.holderRender ? global.holderRender(dom) : dom}
        </ConfigProvider>
      );
    };
  },
});

const flushNotificationQueue = () => {
  if (!notification) {
    const holderFragment = document.createDocumentFragment();

    const newNotification: GlobalNotification = {
      fragment: holderFragment,
    };
    notification = newNotification;
    // Delay render to avoid sync issue

    act(() => {
      const vm = createVNode(() => {
        return (
          <GlobalHolderWrapper
            ref={(node) => {
              const { instance, sync } = (node as any).el || {};

              Promise.resolve().then(() => {
                if (!newNotification.instance && instance) {
                  newNotification.instance = instance;
                  newNotification.sync = sync;
                  flushNotificationQueue();
                }
              });
            }}
          ></GlobalHolderWrapper>
        );
      });

      render(vm, holderFragment as any);
    });

    return;
  }

  // Notification not ready
  if (!notification.instance) {
    return;
  }

  // >>> Execute task
  taskQueue.forEach((task) => {
    switch (task.type) {
      case 'open': {
        act(() => {
          notification!.instance!.open({
            ...defaultGlobalConfig,
            ...task.config,
          });
        });
        break;
      }

      case 'destroy':
        act(() => {
          notification?.instance?.destroy(task.key);
        });
        break;
    }
  });

  // Clean up
  taskQueue = [];
};

// ==============================================================================
// ==                                  Export                                  ==
// ==============================================================================

function setNotificationGlobalConfig(config: GlobalConfigProps) {
  defaultGlobalConfig = {
    ...defaultGlobalConfig,
    ...config,
  };

  // Trigger sync for it
  act(() => {
    notification?.sync?.();
  });
}

function open(config: ArgsProps) {
  taskQueue.push({ type: 'open', config });
  flushNotificationQueue();
}

const destroy: BaseMethods['destroy'] = (key) => {
  taskQueue.push({ type: 'destroy', key });
  flushNotificationQueue();
};

interface BaseMethods {
  open: (config: ArgsProps) => void;
  destroy: (key?: VueKey) => void;
  config: (config: GlobalConfigProps) => void;
  useNotification: typeof useNotification;
  /** @private Internal Component. Do not use in your production. */
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
}

type StaticFn = (config: ArgsProps) => void;

interface NoticeMethods {
  success: StaticFn;
  info: StaticFn;
  warning: StaticFn;
  error: StaticFn;
}

const methods: (keyof NoticeMethods)[] = ['success', 'info', 'warning', 'error'];

const baseStaticMethods: BaseMethods = {
  open,
  destroy,
  config: setNotificationGlobalConfig,
  useNotification,
  _InternalPanelDoNotUseOrYouWillBeFired: PurePanel,
};

const staticMethods = baseStaticMethods as NoticeMethods & BaseMethods;

methods.forEach((type: keyof NoticeMethods) => {
  staticMethods[type] = (config) => open({ ...config, type });
});

// ==============================================================================
// ==                                   Test                                   ==
// ==============================================================================
const noop = () => {};

let _actWrapper: (wrapper: (fn: () => void) => void) => void = noop;
if (process.env.NODE_ENV === 'test') {
  _actWrapper = (wrapper) => {
    act = wrapper;
  };
}
const actWrapper = _actWrapper;
export { actWrapper };

let _actDestroy = noop;
if (process.env.NODE_ENV === 'test') {
  _actDestroy = () => {
    notification = null;
  };
}
const actDestroy = _actDestroy;
export { actDestroy };

export default staticMethods;
