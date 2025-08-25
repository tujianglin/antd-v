import { reactiveComputed } from '@vueuse/core';
import {
  defineComponent,
  inject,
  provide,
  reactive,
  type CSSProperties,
  type InjectionKey,
  type PropType,
  type Reactive,
} from 'vue';
import type { CascaderProps, DefaultOptionType, InternalFieldNames, SingleValueType } from './Cascader.vue';

export interface CascaderContextProps {
  options: NonNullable<CascaderProps['options']>;
  fieldNames: InternalFieldNames;
  values: SingleValueType[];
  halfValues: SingleValueType[];
  changeOnSelect?: boolean;
  onSelect: (valuePath: SingleValueType) => void;
  checkable?: boolean | any;
  searchOptions: DefaultOptionType[];
  popupPrefixCls?: string;
  loadData?: (selectOptions: DefaultOptionType[]) => void;
  expandTrigger?: 'hover' | 'click';
  expandIcon?: any;
  loadingIcon?: any;
  popupMenuColumnStyle?: CSSProperties;
  optionRender?: CascaderProps['optionRender'];
  classNames?: CascaderProps['classNames'];
  styles?: CascaderProps['styles'];
}

const CascaderContext: InjectionKey<Reactive<CascaderContextProps>> = Symbol('CascaderContext');

export const useCascaderContextInject = () => {
  return inject(CascaderContext, reactive<Partial<CascaderContextProps>>({}));
};

export const useCascaderContextProvider = (props: Reactive<CascaderContextProps>) => {
  provide(CascaderContext, props);
};

export const CascaderContextProvider = defineComponent({
  props: {
    value: Object as PropType<CascaderContextProps>,
  },
  setup(props, { slots }) {
    useCascaderContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
