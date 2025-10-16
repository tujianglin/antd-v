import type { VueKey } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, ref, toRefs, type Ref } from 'vue';
import { computeClosable, pickClosable } from '../_util/hooks/useClosable';
import { useConfigContextInject } from '../config-provider/context';
import Holder, { type HolderRef } from './Holder.vue';
import type { ArgsProps, NotificationConfig, NotificationInstance, NotificationPlacement } from './interface';
import PureContent, { type PureContentProps } from './PureContent.vue';
import { getCloseIcon, getCloseIconConfig } from './util';

const DEFAULT_PLACEMENT: NotificationPlacement = 'topRight';

// ==============================================================================
// ==                                  Holder                                  ==
// ==============================================================================
type HolderProps = NotificationConfig & {
  onAllRemoved?: VoidFunction;
};

// ==============================================================================
// ==                                   Hook                                   ==
// ==============================================================================
export function useInternalNotification(notificationConfig?: HolderProps): readonly [Ref<NotificationInstance>, any] {
  const holderRef = ref<HolderRef>(null);
  const { notification: notificationContext } = toRefs(useConfigContextInject());
  // ================================ API ================================
  const wrapAPI = computed<NotificationInstance>(() => {
    // Wrap with notification content

    // >>> Open
    const open = (config: ArgsProps) => {
      const {
        api: { open: originOpen },
        prefixCls,
        notification,
      } = holderRef.value;
      const contextClassName = notification?.class || {};
      const contextStyle = notification?.style || {};
      const contextClassNames = notification?.classNames || {};
      const contextStyles = notification?.styles || {};

      const noticePrefixCls = `${prefixCls}-notice`;
      const {
        title,
        description,
        icon,
        type,
        actions,
        class: className,
        style,
        role = 'alert',
        closeIcon,
        closable,
        classNames: configClassNames = {},
        styles = {},
        ...restConfig
      } = config;

      const realCloseIcon = getCloseIcon(noticePrefixCls, getCloseIconConfig(closeIcon, notificationConfig, notification));
      const [rawClosable, mergedCloseIcon, , ariaProps] = computeClosable(
        pickClosable({ ...(notificationConfig || {}), ...config }),
        pickClosable(notificationContext?.value),
        {
          closable: true,
          closeIcon: realCloseIcon,
        },
      );

      const mergedClosable = rawClosable
        ? {
            onClose: closable && typeof closable === 'object' ? closable.onClose : undefined,
            closeIcon: mergedCloseIcon,
            ...ariaProps,
          }
        : false;

      return originOpen({
        // use placement from props instead of hard-coding "topRight"
        placement: notificationConfig?.placement ?? DEFAULT_PLACEMENT,
        ...restConfig,
        content: (
          <PureContent
            prefixCls={noticePrefixCls}
            icon={icon}
            type={type}
            title={title}
            description={description}
            actions={actions}
            role={role}
            classNames={
              {
                icon: clsx(contextClassNames.icon, configClassNames.icon),
                title: clsx(contextClassNames.title, configClassNames.title),
                description: clsx(contextClassNames.description, configClassNames.description),
                actions: clsx(contextClassNames.actions, configClassNames.actions),
              } as PureContentProps['classNames']
            }
            styles={
              {
                icon: { ...contextStyles.icon, ...styles.icon },
                title: { ...contextStyles.title, ...styles.title },
                description: { ...contextStyles.description, ...styles.description },
                actions: { ...contextStyles.actions, ...styles.actions },
              } as PureContentProps['styles']
            }
          />
        ),
        class: clsx(
          type && `${noticePrefixCls}-${type}`,
          className,
          contextClassName,
          configClassNames.root,
          contextClassNames.root,
        ),
        style: { ...contextStyles.root, ...styles.root, ...contextStyle, ...style },
        closable: mergedClosable as any,
      });
    };

    // >>> destroy
    const destroy = (key?: VueKey) => {
      if (key !== undefined) {
        holderRef.value?.api?.close(key);
      } else {
        holderRef.value?.api?.destroy();
      }
    };

    const clone = {
      open,
      destroy,
    } as NotificationInstance;

    const keys = ['success', 'info', 'warning', 'error'] as const;
    keys.forEach((type) => {
      clone[type] = (config) =>
        open({
          ...config,
          type,
        });
    });

    return clone;
  });

  // ============================== Return ===============================
  return [wrapAPI, () => <Holder key="notification-holder" {...notificationConfig} ref={holderRef} />] as const;
}

export default function useNotification(notificationConfig?: NotificationConfig) {
  return useInternalNotification(notificationConfig);
}
