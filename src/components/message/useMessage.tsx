import Render from '@/vc-component/render';
import type { VueKey } from '@/vc-util/type';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import clsx from 'clsx';
import { ref } from 'vue';
import type { HolderRef } from './Holder.vue';
import Holder from './Holder.vue';
import type { ArgsProps, ConfigOptions, MessageInstance, MessageType, NoticeType, TypeOpen } from './interface';
import PureContent from './PureContent.vue';
import { wrapPromiseFn } from './util';

// ==============================================================================
// ==                                  Holder                                  ==
// ==============================================================================
type HolderProps = ConfigOptions & {
  onAllRemoved?: VoidFunction;
};
let keyIndex = 0;

export function useInternalMessage(messageConfig?: HolderProps): readonly [ReactiveComputedReturn<MessageInstance>, any] {
  const holderRef = ref<HolderRef>(null);

  // ================================ API ================================
  const wrapAPI = reactiveComputed<MessageInstance>(() => {
    // Wrap with notification content

    // >>> close
    const close = (key: VueKey) => {
      holderRef.value?.api?.close(key);
    };

    // >>> Open
    const open = (config: ArgsProps): MessageType => {
      const {
        api: { open: originOpen },
        prefixCls,
        message,
      } = holderRef.value;
      const contextClassName = message?.class || {};
      const contextClassNames = message?.classNames || {};
      const contextStyle = message?.style || {};
      const contextStyles = message?.styles || {};

      const noticePrefixCls = `${prefixCls}-notice`;

      const {
        content,
        icon,
        type,
        key,
        class: className,
        style,
        onClose,
        classNames: configClassNames,
        styles,
        ...restConfig
      } = config;

      let mergedKey: VueKey = key!;
      if (mergedKey === undefined || mergedKey === null) {
        keyIndex += 1;
        mergedKey = `antd-message-${keyIndex}`;
      }
      return wrapPromiseFn((resolve) => {
        originOpen({
          ...restConfig,
          key: mergedKey,
          content: (
            <PureContent
              prefixCls={prefixCls}
              type={type}
              icon={icon}
              classNames={{
                icon: clsx(configClassNames?.icon, contextClassNames.icon),
                content: clsx(configClassNames?.content, contextClassNames.content),
              }}
              styles={{
                icon: { ...contextStyles.icon, ...styles?.icon },
                content: { ...contextStyles.content, ...styles?.content },
              }}
            >
              <Render content={content}></Render>
            </PureContent>
          ),
          placement: 'top',
          class: clsx(
            type && `${noticePrefixCls}-${type}`,
            className,
            contextClassName,
            contextClassNames.root,
            configClassNames?.root,
          ),
          style: { ...contextStyles.root, ...styles?.root, ...contextStyle, ...style },
          onClose: () => {
            onClose?.();
            resolve();
          },
        });

        // Return close function
        return () => {
          close(mergedKey);
        };
      });
    };

    // >>> destroy
    const destroy = (key?: VueKey) => {
      if (key !== undefined) {
        close(key);
      } else {
        holderRef.value?.api?.destroy();
      }
    };

    const clone = {
      open,
      destroy,
    } as MessageInstance;

    const keys: NoticeType[] = ['info', 'success', 'warning', 'error', 'loading'];
    keys.forEach((type) => {
      const typeOpen: TypeOpen = (jointContent, duration, onClose) => {
        let config: ArgsProps;
        if (jointContent && typeof jointContent === 'object' && 'content' in jointContent) {
          config = jointContent as ArgsProps;
        } else {
          config = {
            content: jointContent,
          };
        }

        // Params
        let mergedDuration: number | undefined;
        let mergedOnClose: VoidFunction | undefined;
        if (typeof duration === 'function') {
          mergedOnClose = duration;
        } else {
          mergedDuration = duration;
          mergedOnClose = onClose;
        }

        const mergedConfig = {
          onClose: mergedOnClose,
          duration: mergedDuration,
          ...config,
          type,
        };

        return open(mergedConfig);
      };

      clone[type] = typeOpen;
    });

    return clone;
  });

  // ============================== Return ===============================
  return [wrapAPI, () => <Holder key="message-holder" {...messageConfig} ref={holderRef} />] as const;
}

export default function useMessage(messageConfig?: ConfigOptions) {
  return useInternalMessage(messageConfig);
}
