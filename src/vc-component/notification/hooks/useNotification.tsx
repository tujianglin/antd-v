import type { CSSMotionProps } from '@/vc-component/motion';
import { computed, ref, watch, watchEffect, type AriaAttributes, type CSSProperties, type Ref } from 'vue';
import type { NotificationsProps, NotificationsRef } from '../Notifications.vue';
import Notifications from '../Notifications.vue';
import type { OpenConfig, Placement, StackConfig } from '../interface';

const defaultGetContainer = () => document.body;

type OptionalConfig = Partial<OpenConfig>;

export interface NotificationConfig {
  prefixCls?: string;
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement | ShadowRoot;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);

  closable?: boolean | ({ closeIcon?: any; onClose?: VoidFunction } & AriaAttributes);
  maxCount?: number;
  duration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  /** @private. Config for notification holder style. Safe to remove if refactor */
  className?: (placement: Placement) => string;
  /** @private. Config for notification holder style. Safe to remove if refactor */
  style?: (placement: Placement) => CSSProperties;
  /** @private Trigger when all the notification closed. */
  onAllRemoved?: VoidFunction;
  stack?: StackConfig;
  /** @private Slot for style in Notifications */
  renderNotifications?: NotificationsProps['renderNotifications'];
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void;
  close: (key: PropertyKey) => void;
  destroy: () => void;
}

interface OpenTask {
  type: 'open';
  config: OpenConfig;
}

interface CloseTask {
  type: 'close';
  key: PropertyKey;
}

interface DestroyTask {
  type: 'destroy';
}

type Task = OpenTask | CloseTask | DestroyTask;

let uniqueKey = 0;

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone: T = {} as T;

  objList.forEach((obj) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];

        if (val !== undefined) {
          clone[key] = val;
        }
      });
    }
  });

  return clone;
}

export default function useNotification(rootConfig: NotificationConfig = {}): [Ref<NotificationAPI>, any] {
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    maxCount,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications,
    ...shareConfig
  } = rootConfig;

  const container = ref<HTMLElement | ShadowRoot>();
  const notificationsRef = ref<NotificationsRef>();
  const contextHolder = () => (
    <Notifications
      container={container.value}
      ref={notificationsRef}
      prefixCls={prefixCls}
      motion={motion}
      maxCount={maxCount}
      class={className}
      style={style}
      onAllRemoved={onAllRemoved}
      stack={stack}
      renderNotifications={renderNotifications}
    />
  );

  const taskQueue = ref<Task[]>([]);

  const open = (config) => {
    const mergedConfig = mergeConfig(shareConfig, config) as any;
    if (mergedConfig.key === null || mergedConfig.key === undefined) {
      mergedConfig.key = `rc-notification-${uniqueKey}`;
      uniqueKey += 1;
    }
    taskQueue.value = [...taskQueue.value, { type: 'open', config: mergedConfig }];
  };

  // ========================= Refs =========================
  const api = computed<NotificationAPI>(() => ({
    open,
    close: (key) => {
      taskQueue.value = [...(taskQueue.value as any), { type: 'close', key }];
    },
    destroy: () => {
      taskQueue.value = [...(taskQueue.value as any), { type: 'destroy' }];
    },
  }));

  // ======================= Container ======================
  watchEffect(() => {
    container.value = getContainer();
  });

  // ======================== Effect ========================
  watch(
    taskQueue,
    () => {
      // Flush task when node ready
      if (notificationsRef.value && taskQueue.value.length) {
        taskQueue.value.forEach((task) => {
          switch (task.type) {
            case 'open':
              notificationsRef.value.open(task.config as any);
              break;

            case 'close':
              notificationsRef.value.close(task.key);
              break;

            case 'destroy':
              notificationsRef.value.destroy();
              break;
          }
        });

        // https://github.com/ant-design/ant-design/issues/52590
        // React `startTransition` will run once `useEffect` but many times `setState`,
        // So `setTaskQueue` with filtered array will cause infinite loop.
        // We cache the first match queue instead.
        let oriTaskQueue: Task[];
        let tgtTaskQueue: Task[];

        // React 17 will mix order of effect & setState in async
        // - open: setState[0]
        // - effect[0]
        // - open: setState[1]
        // - effect setState([]) * here will clean up [0, 1] in React 17
        if (oriTaskQueue !== (taskQueue.value as any) || !tgtTaskQueue) {
          oriTaskQueue = taskQueue.value as any;
          tgtTaskQueue = (taskQueue.value as any).filter((task) => !taskQueue.value.includes(task));
        }
        taskQueue.value = tgtTaskQueue;
      }
    },
    { immediate: true, deep: true },
  );

  // ======================== Return ========================
  return [api, contextHolder];
}
