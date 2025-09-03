import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { OptionProps } from './Option';

export interface MentionsContextProps {
  notFoundContent: any;
  activeIndex: number;
  selectOption: (option: OptionProps) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
  onScroll: (e: UIEvent) => void;
}

// We will never use default, here only to fix TypeScript warning
const MentionsContext: InjectionKey<Reactive<MentionsContextProps>> = Symbol('MentionsContext');

export const useMentionsContextInject = () => {
  return inject(MentionsContext, reactive({} as MentionsContextProps));
};

export const useMentionsContextProvider = (props: MentionsContextProps) => {
  provide(MentionsContext, props);
};

export const MentionsContextProvider = defineComponent({
  props: {
    value: Object as PropType<MentionsContextProps>,
  },
  setup(props, { slots }) {
    useMentionsContextProvider(reactiveComputed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});
