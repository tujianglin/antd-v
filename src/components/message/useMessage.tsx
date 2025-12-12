import Render from '@/vc-component/render';
import type { VueKey } from '@/vc-util/type';
import { reactiveComputed, type ReactiveComputedReturn } from '@vueuse/core';
import clsx from 'clsx';
import { ref } from 'vue';
import { mergeClassNames, mergeStyles, resolveStyleOrClass, type SemanticClassNames, type SemanticStyles } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import type { HolderRef } from './Holder.vue';
import Holder from './Holder.vue';
import type { ArgsProps, ConfigOptions, MessageInstance, MessageType, NoticeType, SemanticName, TypeOpen } from './interface';
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
        classNames: originClassNames,
        styles: originStyles,
      } = holderRef.value;
      const contextClassName = message?.class || {};
      const rawContextClassNames = message?.classNames || {};
      const contextStyle = message?.style || {};
      const rawContextStyles = message?.styles || {};

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
      if (!isNonNullable(mergedKey)) {
        keyIndex += 1;
        mergedKey = `antd-message-${keyIndex}`;
      }

      const contextConfig: HolderProps = { ...messageConfig, ...config };

      const contextClassNames = resolveStyleOrClass(rawContextClassNames, { props: contextConfig });
      const semanticClassNames = resolveStyleOrClass(configClassNames, { props: contextConfig });
      const contextStyles = resolveStyleOrClass(rawContextStyles, { props: contextConfig });
      const semanticStyles = resolveStyleOrClass(styles, { props: contextConfig });

      const mergedClassNames: SemanticClassNames<SemanticName> = mergeClassNames(
        undefined,
        contextClassNames,
        semanticClassNames,
        originClassNames,
      );

      const mergedStyles: SemanticStyles<SemanticName> = mergeStyles(contextStyles, semanticStyles, originStyles);
      return wrapPromiseFn((resolve) => {
        originOpen({
          ...restConfig,
          key: mergedKey,
          content: (
            <PureContent prefixCls={prefixCls} type={type} icon={icon} classNames={mergedClassNames} styles={mergedStyles}>
              <Render content={content}></Render>
            </PureContent>
          ),
          placement: 'top',
          class: clsx(type && `${noticePrefixCls}-${type}`, className, contextClassName, mergedClassNames?.root),
          style: { ...mergedStyles.root, ...contextStyle, ...style },
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
