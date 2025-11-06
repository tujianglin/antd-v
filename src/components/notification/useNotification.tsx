import type { VueKey } from '@/vc-util/type';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import clsx from 'clsx';
import { ref, toRefs } from 'vue';
import { mergeClassNames, mergeStyles, resolveStyleOrClass, type SemanticClassNames, type SemanticStyles } from '../_util/hooks';
import { computeClosable, pickClosable } from '../_util/hooks/useClosable';
import { useConfigContextInject } from '../config-provider/context';
import Holder, { type HolderRef } from './Holder.vue';
import type {
  ArgsProps,
  NotificationConfig,
  NotificationInstance,
  NotificationPlacement,
  NotificationSemantic,
} from './interface';
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
export function useInternalNotification(
  notificationConfig?: HolderProps,
): readonly [ReactiveComputedReturn<NotificationInstance>, any] {
  const holderRef = ref<HolderRef>(null);
  const { notification: notificationContext } = toRefs(useConfigContextInject());
  // ================================ API ================================
  const wrapAPI = reactiveComputed<NotificationInstance>(() => {
    // Wrap with notification content

    // >>> Open
    const open = (config: ArgsProps) => {
      const {
        api: { open: originOpen },
        prefixCls,
        notification,
        classNames: originClassNames,
        styles: originStyles,
      } = holderRef.value;
      const contextClassName = notification?.class || {};
      const contextStyle = notification?.style || {};

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

      const semanticClassNames = resolveStyleOrClass(configClassNames, { props: config });
      const semanticStyles = resolveStyleOrClass(styles, { props: config });

      const mergedClassNames: SemanticClassNames<NotificationSemantic> = mergeClassNames(
        undefined,
        originClassNames,
        semanticClassNames,
      );

      const mergedStyles: SemanticStyles<NotificationSemantic> = mergeStyles(originStyles, semanticStyles);

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
            classNames={mergedClassNames as PureContentProps['classNames']}
            styles={mergedStyles as PureContentProps['styles']}
          />
        ),
        class: clsx(type && `${noticePrefixCls}-${type}`, className, contextClassName, mergedClassNames.root),
        style: { ...mergedStyles.root, ...contextStyle, ...style },
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
