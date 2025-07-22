import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { isEmpty } from 'lodash-es';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { DirectionType } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';

export interface SpaceCompactItemContextType {
  compactSize?: SizeType;
  compactDirection?: 'horizontal' | 'vertical';
  isFirstItem?: boolean;
  isLastItem?: boolean;
}

const SpaceCompactItemContext: InjectionKey<Reactive<SpaceCompactItemContextType>> = Symbol('SpaceCompactItemContext');

export const useSpaceCompactItemContextInject = () => {
  return inject(SpaceCompactItemContext, reactive<SpaceCompactItemContextType>({}));
};

export const useSpaceCompactItemContextProvider = (props: Reactive<SpaceCompactItemContextType>) => {
  provide(SpaceCompactItemContext, props);
};

export const useCompactItemContext = (prefixCls: string, direction: ComputedRef<DirectionType>) => {
  const compactItemContext = useSpaceCompactItemContextInject();

  return reactiveComputed(() => {
    let compactItemClassnames = '';
    if (!isEmpty(compactItemContext)) {
      const separator = compactItemContext.compactDirection === 'vertical' ? '-vertical-' : '-';
      compactItemClassnames = clsx(`${prefixCls}-compact${separator}item`, {
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
    value: Object as PropType<SpaceCompactItemContextType>,
  },
  setup(props, { slots }) {
    useSpaceCompactItemContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots.default?.()}</>;
  },
});
