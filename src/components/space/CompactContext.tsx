import { cn } from '@/utils/cn';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, type ComputedRef, type InjectionKey, type PropType } from 'vue';
import type { DirectionType } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';

export interface SpaceCompactItemContextType {
  compactSize?: SizeType;
  compactDirection?: 'horizontal' | 'vertical';
  isFirstItem?: boolean;
  isLastItem?: boolean;
}

const spaceCompactItemContextProviderKey: InjectionKey<SpaceCompactItemContextType> = Symbol('spaceCompactItemContextProvider');

export const useSpaceCompactItemContextInject = () => {
  return inject(spaceCompactItemContextProviderKey, null);
};

export const useSpaceCompactItemContextProvider = (props: SpaceCompactItemContextType) => {
  provide(spaceCompactItemContextProviderKey, props);
};

export const useCompactItemContext = (prefixCls: string, direction: ComputedRef<DirectionType>) => {
  const compactItemContext = useSpaceCompactItemContextInject();

  return reactiveComputed(() => {
    let compactItemClassnames = '';
    if (compactItemContext) {
      const separator = compactItemContext.compactDirection === 'vertical' ? '-vertical-' : '-';
      compactItemClassnames = cn(`${prefixCls}-compact${separator}item`, {
        [`${prefixCls}-compact${separator}first-item`]: compactItemContext.isFirstItem,
        [`${prefixCls}-compact${separator}last-item`]: compactItemContext.isLastItem,
        [`${prefixCls}-compact${separator}item-rtl`]: direction.value === 'rtl',
      });
    }
    return {
      compactSize: compactItemContext?.compactSize,
      compactDirection: compactItemContext?.compactDirection,
      compactItemClassnames,
    };
  });
};

export const SpaceCompactItemContextProvider = defineComponent({
  props: {
    value: {
      type: Object as PropType<SpaceCompactItemContextType>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    useSpaceCompactItemContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});
