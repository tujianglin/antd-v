import type { ValidateMessages } from '@/vc-component/form/interface';
import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';

const ValidateMessagesContext: InjectionKey<Ref<ValidateMessages | undefined>> = Symbol('ValidateMessagesContext');

export const useValidateMessagesContextInject = () => {
  return inject(ValidateMessagesContext, ref(undefined));
};

export const useValidateMessagesContextProvider = (messages: Ref<ValidateMessages | undefined>) => {
  provide(ValidateMessagesContext, messages);
};

export default ValidateMessagesContext;
