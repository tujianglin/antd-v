import { defineComponent, inject, provide, ref, type InjectionKey, type PropType } from 'vue';
import type { FieldData, FormInstance, Store, ValidateMessages } from './interface';

export type Forms = Record<string, FormInstance>;

export interface FormChangeInfo {
  changedFields: FieldData[];
  forms: Forms;
}

export interface FormFinishInfo {
  values: Store;
  forms: Forms;
}

export interface FormProviderProps {
  validateMessages?: ValidateMessages;
  onFormChange?: (name: string, info: FormChangeInfo) => void;
  onFormFinish?: (name: string, info: FormFinishInfo) => void;
}

export interface FormContextProps extends FormProviderProps {
  triggerFormChange: (name: string, changedFields: FieldData[]) => void;
  triggerFormFinish: (name: string, values: Store) => void;
  registerForm: (name: string, form: FormInstance) => void;
  unregisterForm: (name: string) => void;
}

const FormContext: InjectionKey<FormContextProps> = Symbol('FormContext');

export const useFormContextInject = (): FormContextProps => {
  return inject(FormContext, {
    triggerFormChange: () => {},
    triggerFormFinish: () => {},
    registerForm: () => {},
    unregisterForm: () => {},
  } as FormContextProps);
};

export const useFormContextProvider = (form: FormContextProps) => {
  return provide(FormContext, form);
};

export const FormContextProvider = defineComponent({
  name: 'FormContextProvider',
  props: {
    value: Object as PropType<FormContextProps>,
  },
  setup(props, { slots }) {
    useFormContextProvider(props.value);
    return () => slots.default?.();
  },
});

const FormProvider = defineComponent({
  name: 'FormProvider',
  props: {
    value: Object as PropType<FormProviderProps>,
  },
  setup(props, { slots }) {
    const formContext = useFormContextInject();

    const formsRef = ref<Forms>({});
    return () => (
      <FormContextProvider
        value={{
          ...formContext,
          validateMessages: {
            ...formContext.validateMessages,
            ...props.value?.validateMessages,
          },

          // =========================================================
          // =                  Global Form Control                  =
          // =========================================================
          triggerFormChange: (name, changedFields) => {
            if (props.value?.onFormChange) {
              props.value?.onFormChange(name, {
                changedFields,
                forms: formsRef.value,
              });
            }

            formContext.triggerFormChange(name, changedFields);
          },
          triggerFormFinish: (name, values) => {
            if (props.value?.onFormFinish) {
              props.value?.onFormFinish(name, {
                values,
                forms: formsRef.value,
              });
            }

            formContext.triggerFormFinish(name, values);
          },
          registerForm: (name, form) => {
            if (name) {
              formsRef.value = {
                ...formsRef.value,
                [name]: form,
              };
            }

            formContext.registerForm(name, form);
          },
          unregisterForm: (name) => {
            const newForms = { ...formsRef.value };
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete newForms[name];
            formsRef.value = newForms;

            formContext.unregisterForm(name);
          },
        }}
      >
        {slots.default?.()}
      </FormContextProvider>
    );
  },
});

export { FormProvider };

export default FormContext;
