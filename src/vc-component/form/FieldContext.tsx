import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import { defineComponent, inject, provide, reactive, type InjectionKey, type PropType, type Reactive } from 'vue';
import type { InternalFormInstance } from './interface';

export const HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS';

const warningFunc: any = () => {
  warning(false, 'Can not find FormContext. Please make sure you wrap Field under Form.');
};

const defaultFormInstance: InternalFormInstance = {
  getFieldValue: warningFunc,
  getFieldsValue: warningFunc,
  getFieldError: warningFunc,
  getFieldWarning: warningFunc,
  getFieldsError: warningFunc,
  isFieldsTouched: warningFunc,
  isFieldTouched: warningFunc,
  isFieldValidating: warningFunc,
  isFieldsValidating: warningFunc,
  resetFields: warningFunc,
  setFields: warningFunc,
  setFieldValue: warningFunc,
  setFieldsValue: warningFunc,
  validateFields: warningFunc,
  submit: warningFunc,

  getInternalHooks: () => {
    warningFunc();

    return {
      dispatch: warningFunc,
      initEntityValue: warningFunc,
      registerField: warningFunc,
      useSubscribe: warningFunc,
      setInitialValues: warningFunc,
      destroyForm: warningFunc,
      setCallbacks: warningFunc,
      registerWatch: warningFunc,
      getFields: warningFunc,
      setValidateMessages: warningFunc,
      setPreserve: warningFunc,
      getInitialValue: warningFunc,
    };
  },
};

const FieldContext: InjectionKey<Reactive<InternalFormInstance>> = Symbol('FieldContext');

// 提供便捷的 useFieldContext hook
export const useFieldContextInject = () => {
  return inject(FieldContext, reactive(defaultFormInstance));
};

export const useFieldContextProvider = (form: Reactive<InternalFormInstance>) => {
  provide(FieldContext, reactive(form));
};

export const FieldContextProvider = defineComponent({
  name: 'FieldContextProvider',
  props: {
    value: Object as PropType<InternalFormInstance>,
  },
  setup(props, { slots }) {
    useFieldContextProvider(reactiveComputed(() => props.value));
    return () => slots.default?.();
  },
});

export { FieldContextProvider as default };
