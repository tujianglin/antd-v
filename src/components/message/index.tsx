import type { VueKey } from '@/vc-util/type';
import { computed, defineComponent, onMounted, ref, toRefs, type PropType } from 'vue';
import { useAppConfigContextInject } from '../app/context';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import { globalConfig } from '../config-provider/global';
import { unstableSetRender } from '../config-provider/UnstableContext';
import type { ArgsProps, ConfigOptions, MessageInstance, MessageType, NoticeType, TypeOpen } from './interface';
import PurePanel from './PurePanel.vue';
import useMessage, { useInternalMessage } from './useMessage';
import { wrapPromiseFn } from './util';

export type { ArgsProps };

let message: GlobalMessage | null = null;

let act: (callback: VoidFunction) => Promise<void> | void = (callback) => callback();

interface GlobalMessage {
  fragment: DocumentFragment;
  instance?: MessageInstance | null;
  sync?: VoidFunction;
}

interface OpenTask {
  type: 'open';
  config: ArgsProps;
  resolve: VoidFunction;
  setCloseFn: (closeFn: VoidFunction) => void;
  skipped?: boolean;
}

interface TypeTask {
  type: NoticeType;
  args: Parameters<TypeOpen>;
  resolve: VoidFunction;
  setCloseFn: (closeFn: VoidFunction) => void;
  skipped?: boolean;
}

type Task =
  | OpenTask
  | TypeTask
  | {
      type: 'destroy';
      key?: VueKey;
      skipped?: boolean;
    };

let taskQueue: Task[] = [];

let defaultGlobalConfig: ConfigOptions = {};

function getGlobalContext() {
  const { getContainer, duration, rtl, maxCount, top } = defaultGlobalConfig;
  const mergedContainer = getContainer?.() || document.body;

  return { getContainer: () => mergedContainer, duration, rtl, maxCount, top };
}

const GlobalHolder = defineComponent({
  props: {
    messageConfig: Object as PropType<ConfigOptions>,
    sync: Function as PropType<() => void>,
  },
  setup(props, { expose }) {
    const { messageConfig, sync } = toRefs(props);

    const { getPrefixCls } = toRefs(useConfigContextInject());
    const prefixCls = computed(() => defaultGlobalConfig.prefixCls || getPrefixCls.value('message'));
    const appConfig = useAppConfigContextInject();

    const [api, Holder] = useInternalMessage({
      ...messageConfig.value,
      prefixCls: prefixCls.value,
      ...appConfig.message,
    });

    onMounted(() => {
      sync?.value?.();
    });

    expose({
      get instance() {
        const instance: MessageInstance = { ...api };

        Object.keys(instance).forEach((method) => {
          instance[method as keyof MessageInstance] = (...args: any[]) => {
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
    const messageConfig = ref<ConfigOptions>(getGlobalContext());

    const sync = () => {
      messageConfig.value = getGlobalContext();
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
      const dom = <GlobalHolder ref={domRef} sync={sync} messageConfig={messageConfig.value as any} />;

      return (
        <ConfigProvider prefixCls={rootPrefixCls} iconPrefixCls={rootIconPrefixCls} theme={theme}>
          {global.holderRender ? global.holderRender(dom) : dom}
        </ConfigProvider>
      );
    };
  },
});

const flushMessageQueue = () => {
  if (!message) {
    const holderFragment = document.createDocumentFragment();

    const newMessage: GlobalMessage = {
      fragment: holderFragment,
    };

    message = newMessage;

    // Delay render to avoid sync issue
    const reactRender = unstableSetRender();
    act(() => {
      reactRender(
        () => (
          <GlobalHolderWrapper
            ref={(node) => {
              const { instance, sync } = (node as any).el || {};
              Promise.resolve().then(() => {
                if (!newMessage.instance && instance) {
                  newMessage.instance = instance;
                  newMessage.sync = sync;
                  flushMessageQueue();
                }
              });
            }}
          />
        ),
        holderFragment,
      );
    });

    return;
  }

  // Notification not ready
  if (!message.instance) {
    return;
  }

  // >>> Execute task
  taskQueue.forEach((task) => {
    const { type, skipped } = task;

    // Only `skipped` when user call notice but cancel it immediately
    // and instance not ready
    if (!skipped) {
      switch (type) {
        case 'open': {
          act(() => {
            const closeFn = message!.instance!.open({
              ...defaultGlobalConfig,
              ...task.config,
            });

            closeFn?.then(task.resolve);
            task.setCloseFn(closeFn);
          });
          break;
        }

        case 'destroy':
          act(() => {
            message?.instance!.destroy(task.key);
          });
          break;

        // Other type open
        default: {
          act(() => {
            const closeFn = message!.instance![type](...task.args);

            closeFn?.then(task.resolve);
            task.setCloseFn(closeFn);
          });
        }
      }
    }
  });

  // Clean up
  taskQueue = [];
};

// ==============================================================================
// ==                                  Export                                  ==
// ==============================================================================

function setMessageGlobalConfig(config: ConfigOptions) {
  defaultGlobalConfig = {
    ...defaultGlobalConfig,
    ...config,
  };

  // Trigger sync for it
  act(() => {
    message?.sync?.();
  });
}

function open(config: ArgsProps): MessageType {
  const result = wrapPromiseFn((resolve) => {
    let closeFn: VoidFunction;

    const task: OpenTask = {
      type: 'open',
      config,
      resolve,
      setCloseFn: (fn) => {
        closeFn = fn;
      },
    };
    taskQueue.push(task);

    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });

  flushMessageQueue();

  return result;
}

function typeOpen(type: NoticeType, args: Parameters<TypeOpen>): MessageType {
  const result = wrapPromiseFn((resolve) => {
    let closeFn: VoidFunction;

    const task: TypeTask = {
      type,
      args,
      resolve,
      setCloseFn: (fn) => {
        closeFn = fn;
      },
    };

    taskQueue.push(task);

    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });

  flushMessageQueue();

  return result;
}

const destroy: BaseMethods['destroy'] = (key) => {
  taskQueue.push({ type: 'destroy', key });
  flushMessageQueue();
};

interface BaseMethods {
  open: (config: ArgsProps) => MessageType;
  destroy: (key?: VueKey) => void;
  config: typeof setMessageGlobalConfig;
  useMessage: typeof useMessage;
  /** @private Internal Component. Do not use in your production. */
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
}

interface MessageMethods {
  info: TypeOpen;
  success: TypeOpen;
  error: TypeOpen;
  warning: TypeOpen;
  loading: TypeOpen;
}

const methods: (keyof MessageMethods)[] = ['success', 'info', 'warning', 'error', 'loading'];

const baseStaticMethods: BaseMethods = {
  open,
  destroy,
  config: setMessageGlobalConfig,
  useMessage,
  _InternalPanelDoNotUseOrYouWillBeFired: PurePanel,
};

const staticMethods = baseStaticMethods as MessageMethods & BaseMethods;

methods.forEach((type: keyof MessageMethods) => {
  staticMethods[type] = (...args: Parameters<TypeOpen>) => typeOpen(type, args);
});

// ==============================================================================
// ==                                   Test                                   ==
// ==============================================================================
const noop = () => {};

let _actWrapper: (wrapper: any) => void = noop;
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
    message = null;
  };
}
const actDestroy = _actDestroy;
export { actDestroy };

export default staticMethods;
