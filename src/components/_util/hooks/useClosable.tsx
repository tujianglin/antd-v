import type { DialogProps } from '@/vc-component/dialog';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueNode } from '@/vc-util/type';
import { CloseOutlined } from '@ant-design/icons-vue';
import { type AriaAttributes, type VNode } from 'vue';
import { useLocale } from '../../locale';
import defaultLocale from '../../locale/en_US';
import extendsObject from '../extendsObject';

export type ClosableType = DialogProps['closable'];
export type BaseContextClosable = { closable?: ClosableType; closeIcon?: VueNode };
export type ContextClosable<T extends BaseContextClosable = any> = Partial<Pick<T, 'closable' | 'closeIcon'>>;

export function pickClosable<T extends BaseContextClosable>(context?: ContextClosable<T>): ContextClosable<T> | undefined {
  if (!context) {
    return undefined;
  }
  const { closable, closeIcon } = context;
  return { closable, closeIcon };
}

/** Collection contains the all the props related with closable. e.g. `closable`, `closeIcon` */
interface ClosableCollection {
  closable?: ClosableType;
  closeIcon?: VueNode | boolean;
  disabled?: boolean;
}

interface FallbackCloseCollection extends ClosableCollection {
  /**
   * Some components need to wrap CloseIcon twice,
   * this method will be executed once after the final CloseIcon is calculated
   */
  closeIconRender?: (closeIcon: VueNode | boolean) => VueNode | boolean;
}

const EmptyFallbackCloseCollection: ClosableCollection = {};

type DataAttributes = {
  [key: `data-${string}`]: string;
};

function computeClosableConfig(closable?: ClosableType, closeIcon?: VueNode | boolean): ClosableType | boolean | null {
  if (!closable && (closable === false || closeIcon === false || closeIcon === null)) {
    return false;
  }

  if (closable === undefined && closeIcon === undefined) {
    return null;
  }

  let closableConfig: ClosableType = {
    closeIcon: typeof closeIcon !== 'boolean' && closeIcon !== null ? closeIcon : undefined,
  };

  if (closable && typeof closable === 'object') {
    closableConfig = {
      ...closableConfig,
      ...closable,
    };
  }
  return closableConfig;
}

function mergeClosableConfigs(
  propConfig: ReturnType<typeof computeClosableConfig>,
  contextConfig: ReturnType<typeof computeClosableConfig>,
  fallbackConfig: ClosableCollection & { closeIconRender?: (icon: VueNode | boolean) => VueNode | boolean },
) {
  if (propConfig === false) return false;
  if (propConfig) return extendsObject(fallbackConfig, contextConfig, propConfig);

  if (contextConfig === false) return false;
  if (contextConfig) return extendsObject(fallbackConfig, contextConfig);

  return fallbackConfig.closable ? fallbackConfig : false;
}

function computeCloseIcon(
  mergedConfig: ClosableCollection,
  fallbackCloseCollection: FallbackCloseCollection,
  closeLabel: string,
): [VueNode | boolean, AriaAttributes & DataAttributes] {
  const { closeIconRender } = fallbackCloseCollection;
  const { closeIcon, ...restConfig } = mergedConfig;

  let finalCloseIcon = closeIcon;
  const ariaOrDataProps = pickAttrs(restConfig, true);

  if (finalCloseIcon !== null && finalCloseIcon !== undefined) {
    if (closeIconRender) {
      finalCloseIcon = closeIconRender(finalCloseIcon);
    }

    finalCloseIcon = isValidElement(finalCloseIcon) ? (
      cloneElement(finalCloseIcon, {
        'aria-label': closeLabel,
        ...(finalCloseIcon as VNode)?.props,
        ...ariaOrDataProps,
      })
    ) : (
      <span aria-label={closeLabel} {...ariaOrDataProps}>
        {finalCloseIcon}
      </span>
    );
  }

  return [finalCloseIcon, ariaOrDataProps];
}

export function computeClosable(
  propCloseCollection?: ClosableCollection,
  contextCloseCollection?: ClosableCollection | null,
  fallbackCloseCollection: FallbackCloseCollection = EmptyFallbackCloseCollection,
  closeLabel = 'Close',
): [
  closable: boolean,
  closeIcon: VueNode | boolean,
  closeBtnIsDisabled: boolean,
  ariaOrDataProps: AriaAttributes & DataAttributes,
] {
  const propConfig = computeClosableConfig(propCloseCollection?.closable, propCloseCollection?.closeIcon);
  const contextConfig = computeClosableConfig(contextCloseCollection?.closable, contextCloseCollection?.closeIcon);

  const mergedFallback = {
    closeIcon: <CloseOutlined />,
    ...fallbackCloseCollection,
  };

  const mergedConfig = mergeClosableConfigs(propConfig, contextConfig, mergedFallback);

  const closeBtnIsDisabled = typeof mergedConfig !== 'boolean' ? !!mergedConfig?.disabled : false;
  if (mergedConfig === false) {
    return [false, null, closeBtnIsDisabled, {}];
  }

  const [closeIcon, ariaProps] = computeCloseIcon(mergedConfig, mergedFallback, closeLabel);
  return [true, closeIcon, closeBtnIsDisabled, ariaProps];
}

function useClosable(
  propCloseCollection?: ClosableCollection,
  contextCloseCollection?: ClosableCollection | null,
  fallbackCloseCollection: FallbackCloseCollection = EmptyFallbackCloseCollection,
) {
  const [contextLocale] = useLocale('global', defaultLocale.global);
  return computeClosable(
    propCloseCollection,
    contextCloseCollection,
    {
      closeIcon: <CloseOutlined />,
      ...fallbackCloseCollection,
    },
    contextLocale.value.close,
  );
}

export default useClosable;
