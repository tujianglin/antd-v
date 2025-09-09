import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, toRefs, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { ScreenSizeMap } from '../_util/responsiveObserver';

export type AvatarSize = 'large' | 'small' | 'default' | number | ScreenSizeMap;

export interface AvatarContextType {
  size?: AvatarSize;
  shape?: 'circle' | 'square';
}

const AvatarContext: InjectionKey<Reactive<AvatarContextType>> = Symbol('AvatarContext');

export const useAvatarContextInject = () => {
  return inject(AvatarContext, reactive<Partial<AvatarContextType>>({}));
};

export const useAvatarContextProvider = (props: Reactive<AvatarContextType>) => {
  provide(AvatarContext, props);
};

export const AvatarContextProvider = defineComponent({
  props: {
    value: Object as PropType<AvatarContextType>,
  },
  setup(props, { slots }) {
    const { size, shape } = toRefs(useAvatarContextInject());
    useAvatarContextProvider(
      reactiveComputed(() => ({ shape: props.value.shape || shape?.value, size: props.value.size || size?.value })),
    );
    return () => <>{slots?.default?.()}</>;
  },
});
