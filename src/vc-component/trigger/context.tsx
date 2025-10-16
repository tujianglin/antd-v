import type { CSSMotionProps } from '@/vc-component/motion';
import { defineComponent, inject, provide, type CSSProperties, type InjectionKey, type PropType } from 'vue';
import type { TriggerProps } from './index.vue';
import type { AlignType, ArrowTypeOuter, BuildInPlacements } from './interface';

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext: InjectionKey<TriggerContextProps | null> = Symbol('TriggerContext');

export const useTriggerContextInject = () => {
  return inject(TriggerContext, null);
};

export const useTriggerContextProvider = (props: TriggerContextProps) => {
  provide(TriggerContext, props);
};

export const TriggerContextProvider = defineComponent({
  props: {
    value: Object as PropType<TriggerContextProps>,
  },
  setup(props, { slots }) {
    useTriggerContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});

export interface UniqueShowOptions {
  id: string;
  popup: TriggerProps['popup'];
  target: HTMLElement;
  delay: number;
  prefixCls?: string;
  popupClassName?: string;
  uniqueContainerClassName?: string;
  uniqueContainerStyle?: CSSProperties;
  popupStyle?: CSSProperties;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  popupAlign?: AlignType;
  zIndex?: number;
  mask?: boolean;
  maskClosable?: boolean;
  popupMotion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;
  arrow?: ArrowTypeOuter;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  getPopupClassNameFromAlign?: (align: AlignType) => string;
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions, isOpen: () => boolean) => void;
  hide: (delay: number) => void;
}

const UniqueContext: InjectionKey<UniqueContextProps | null> = Symbol('UniqueContext');

export const useUniqueContextInject = () => {
  return inject(UniqueContext, null);
};

export const useUniqueContextProvider = (props: UniqueContextProps) => {
  provide(UniqueContext, props);
};

export const UniqueContextProvider = defineComponent({
  props: {
    value: Object as PropType<UniqueContextProps>,
  },
  setup(props, { slots }) {
    useUniqueContextProvider(props.value);
    return () => <>{slots.default?.()}</>;
  },
});
